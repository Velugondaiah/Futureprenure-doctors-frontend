import React, { useState, useEffect, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Cookies from 'js-cookie';
import './index.css';
import io from 'socket.io-client';

const VideoRoom = () => {
    // Get meeting ID and history
    const { meeting_id } = useParams();
    const history = useHistory();

    // State
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const peerConnectionRef = useRef(null);
    const socketRef = useRef(null);

    // Refs for video elements
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    const handleEndCall = () => {
        // Stop all tracks
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        
        // Redirect based on user type
        const isDoctor = window.location.pathname.includes('/doctor/');
        history.push(isDoctor ? '/doctor-booking-history' : '/booking-history');
    };

    useEffect(() => {
        let stream = null;

        const init = async () => {
            try {
                // 1. Get local media stream
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                
                console.log('Doctor: Local stream obtained');
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // 2. Create peer connection
                const pc = new RTCPeerConnection({
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        {
                            urls: 'turn:numb.viagenie.ca',
                            username: 'webrtc@live.com',
                            credential: 'muazkh'
                        }
                    ]
                });

                // Add local stream tracks to peer connection
                stream.getTracks().forEach(track => {
                    console.log('Doctor: Adding track to peer connection');
                    pc.addTrack(track, stream);
                });

                // Handle incoming stream
                pc.ontrack = (event) => {
                    console.log('Doctor: Received remote track');
                    if (remoteVideoRef.current && event.streams[0]) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                    }
                };

                // ICE candidate handling
                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        console.log('Doctor: Sending ICE candidate');
                        socketRef.current.emit('ice-candidate', {
                            candidate: event.candidate,
                            meeting_id
                        });
                    }
                };

                pc.oniceconnectionstatechange = () => {
                    console.log('Doctor ICE Connection State:', pc.iceConnectionState);
                };

                peerConnectionRef.current = pc;

                // 3. Set up socket connection
                socketRef.current = io('http://localhost:3009', {
                    transports: ['websocket']
                });

                socketRef.current.on('connect', () => {
                    console.log('Doctor: Socket connected');
                    socketRef.current.emit('join-room', { meeting_id, isDoctor: true });
                });

                socketRef.current.on('offer', async (offer) => {
                    console.log('Doctor: Received offer');
                    try {
                        await pc.setRemoteDescription(new RTCSessionDescription(offer));
                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);
                        console.log('Doctor: Sending answer');
                        socketRef.current.emit('answer', { answer, meeting_id });
                    } catch (err) {
                        console.error('Doctor: Error handling offer:', err);
                    }
                });

                socketRef.current.on('ice-candidate', async (candidate) => {
                    try {
                        if (pc.remoteDescription) {
                            console.log('Doctor: Adding ICE candidate');
                            await pc.addIceCandidate(new RTCIceCandidate(candidate));
                        }
                    } catch (err) {
                        console.error('Doctor: Error adding ICE candidate:', err);
                    }
                });

            } catch (err) {
                console.error('Doctor: Error initializing:', err);
                setError(err.message);
            }
        };

        init();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [meeting_id]);

    return (
        <div className="video-room">
            <div className="video-container">
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="local-video"
                />
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="remote-video"
                />
                {!isConnected && (
                    <div className="connecting-message">
                        Waiting for other participant to join...
                    </div>
                )}
            </div>
            <div className="controls">
                <button onClick={handleEndCall} className="end-call">
                    End Call
                </button>
            </div>
            {error && (
                <div className="error-overlay">
                    <div className="error-message">
                        {error}
                        <button onClick={handleEndCall}>
                            Return to Appointments
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoRoom; 