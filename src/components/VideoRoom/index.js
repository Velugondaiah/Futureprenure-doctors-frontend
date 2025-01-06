import React, { useState, useEffect, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import io from 'socket.io-client';
import './index.css';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhone, FaNotesMedical } from 'react-icons/fa';

const VideoRoom = () => {
    const { meeting_id } = useParams();
    const history = useHistory();

    // Refs
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const socketRef = useRef(null);
    const peerConnectionRef = useRef(null);

    // State variables
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Waiting for patient...');

    // Control functions
    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    const handleEndCall = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        history.push('/doctor-booking-history');
    };

    // WebRTC initialization
    useEffect(() => {
        const initializeWebRTC = async () => {
            try {
                // Get local media stream
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // Create peer connection
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

                peerConnectionRef.current = pc;

                // Add tracks to peer connection
                stream.getTracks().forEach(track => {
                    pc.addTrack(track, stream);
                });

                // Handle incoming stream
                pc.ontrack = (event) => {
                    if (remoteVideoRef.current && event.streams[0]) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                        setIsConnected(true);
                        setConnectionStatus('Connected');
                    }
                };

                // Set up socket connection
                const socket = io('https://backend-diagno.onrender.com', {
                    transports: ['websocket']
                });

                socketRef.current = socket;

                socket.on('connect', () => {
                    console.log('Connected to socket server');
                    socket.emit('join-room', { meeting_id, isDoctor: true });
                });

                // Handle socket events
                socket.on('offer', async (offer) => {
                    try {
                        await pc.setRemoteDescription(new RTCSessionDescription(offer));
                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);
                        socket.emit('answer', { answer, meeting_id });
                    } catch (err) {
                        console.error('Error handling offer:', err);
                    }
                });

                socket.on('ice-candidate', async (candidate) => {
                    try {
                        if (pc.remoteDescription) {
                            await pc.addIceCandidate(new RTCIceCandidate(candidate));
                        }
                    } catch (err) {
                        console.error('Error adding ICE candidate:', err);
                    }
                });

                // ICE candidate handling
                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit('ice-candidate', {
                            candidate: event.candidate,
                            meeting_id
                        });
                    }
                };

                return stream;
            } catch (err) {
                console.error('Error initializing WebRTC:', err);
                setError(err.message);
                return null;
            }
        };

        initializeWebRTC();

        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [meeting_id]);

    // Error state JSX
    if (error) {
        return (
            <div className="video-room error-state">
                <div className="error-container">
                    <h2>Connection Error</h2>
                    <p>{error}</p>
                    <button onClick={handleEndCall}>
                        Return to Appointments
                    </button>
                </div>
            </div>
        );
    }

    // Main component JSX
    return (
        <div className="video-room">
            <div className="consultation-header">
                <div className="consultation-info">
                    <h2>Patient Consultation</h2>
                    <div className="consultation-status">
                        <div className={`status-indicator ${isConnected ? 'connected' : ''}`}></div>
                        <span>{connectionStatus}</span>
                    </div>
                </div>
                <div className="meeting-details">
                    <span>Meeting ID: {meeting_id}</span>
                </div>
            </div>

            <div className="consultation-content">
                <div className="video-container">
                    <div className="main-video-wrapper">
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="remote-video"
                        />
                        <div className="local-video-container">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="local-video"
                            />
                        </div>
                        {!isConnected && (
                            <div className="connecting-overlay">
                                <div className="connecting-message">
                                    Waiting for patient to join...
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="consultation-sidebar">
                    <div className="patient-info">
                        <h3>Patient Information</h3>
                        <div className="patient-details">
                            {/* Add patient details here */}
                        </div>
                    </div>
                    <div className="consultation-notes">
                        <div className="notes-header">
                            <h3>Consultation Notes</h3>
                            <button className="save-notes">Save</button>
                        </div>
                        <div className="notes-content">
                            {/* Add notes editor here */}
                        </div>
                    </div>
                </div>
            </div>

            <div className="controls">
                <div className="control-group">
                    <button 
                        className={`control-button ${isMuted ? 'active' : ''}`}
                        onClick={toggleMute}
                    >
                        {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                    </button>
                    <button 
                        className={`control-button ${isVideoOff ? 'active' : ''}`}
                        onClick={toggleVideo}
                    >
                        {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
                    </button>
                </div>
                
                <div className="control-group">
                    <button 
                        className="control-button notes-button"
                        onClick={() => {/* Add notes functionality */}}
                    >
                        <FaNotesMedical />
                    </button>
                    <button 
                        className="control-button end-call"
                        onClick={handleEndCall}
                    >
                        <FaPhone style={{ transform: 'rotate(135deg)' }} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoRoom; 