import React, { useState, useEffect, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import io from 'socket.io-client';
import './index.css';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhone, FaNotesMedical, FaThermometer } from 'react-icons/fa';
import Cookies from 'js-cookie';
const API_URL = process.env.REACT_APP_API_URL;

const VideoRoom = () => {
    const { meeting_id } = useParams();
    const history = useHistory();

    // Refs for maintaining connections
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const socketRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);

    // State variables
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');
    const [appointmentDetails, setAppointmentDetails] = useState({
        temperature: null,
        patient_name: '',
        // ... other appointment details
    });

    const createPeerConnection = () => {
        console.log('Doctor: Creating peer connection');
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
        if (localStreamRef.current) {
            console.log('Doctor: Adding local tracks to peer connection');
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        pc.ontrack = (event) => {
            console.log('Doctor: Received remote track');
            if (remoteVideoRef.current && event.streams[0]) {
                console.log('Doctor: Setting remote video stream');
                remoteVideoRef.current.srcObject = event.streams[0];
                setIsConnected(true);
                setConnectionStatus('Connected');
            }
        };

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
            console.log('Doctor ICE connection state:', pc.iceConnectionState);
        };

        pc.onconnectionstatechange = () => {
            console.log('Doctor connection state:', pc.connectionState);
        };

        return pc;
    };

    useEffect(() => {
        const init = async () => {
            try {
                console.log('Doctor: Initializing media stream');
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                socketRef.current = io('${API_URL}');

                socketRef.current.on('connect', () => {
                    console.log('Doctor: Socket connected');
                    socketRef.current.emit('join-room', {
                        meeting_id,
                        role: 'Doctor'
                    });
                });

                socketRef.current.on('start-call', async () => {
                    console.log('Doctor: Starting call');
                    if (!peerConnectionRef.current) {
                        peerConnectionRef.current = createPeerConnection();
                    }

                    try {
                        const offer = await peerConnectionRef.current.createOffer();
                        await peerConnectionRef.current.setLocalDescription(offer);
                        
                        console.log('Doctor: Sending offer');
                        socketRef.current.emit('offer', {
                            offer,
                            meeting_id
                        });
                    } catch (err) {
                        console.error('Doctor: Error creating offer:', err);
                    }
                });

                socketRef.current.on('answer', async ({ answer }) => {
                    console.log('Doctor: Received answer');
                    if (peerConnectionRef.current) {
                        try {
                            await peerConnectionRef.current.setRemoteDescription(
                                new RTCSessionDescription(answer)
                            );
                            console.log('Doctor: Set remote description success');
                        } catch (err) {
                            console.error('Doctor: Error setting remote description:', err);
                        }
                    }
                });

                socketRef.current.on('ice-candidate', async ({ candidate }) => {
                    console.log('Doctor: Received ICE candidate');
                    if (peerConnectionRef.current) {
                        try {
                            await peerConnectionRef.current.addIceCandidate(
                                new RTCIceCandidate(candidate)
                            );
                            console.log('Doctor: Added ICE candidate success');
                        } catch (err) {
                            console.error('Doctor: Error adding ICE candidate:', err);
                        }
                    }
                });

            } catch (err) {
                console.error('Doctor: Initialization error:', err);
                setError(err.message);
            }
        };

        init();

        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [meeting_id]);

    useEffect(() => {
        const fetchAppointmentDetails = async () => {
            try {
                const response = await fetch(`${API_URL}/api/appointments/${meeting_id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch appointment details');
                }
                const data = await response.json();
                console.log('Fetched appointment details:', data); // Debug log
                setAppointmentDetails(data);
            } catch (err) {
                console.error('Error fetching appointment details:', err);
            }
        };

        fetchAppointmentDetails();
        // Set up an interval to periodically fetch updates
        const intervalId = setInterval(fetchAppointmentDetails, 10000); // Fetch every 10 seconds

        return () => clearInterval(intervalId); // Cleanup interval on unmount
    }, [meeting_id]);

    // Control functions
    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    const handleEndCall = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        history.push('/doctor-booking-history');
    };

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
                    
                    {/* Temperature overlay */}
                    <div className="vital-signs-overlay">
                        <div className="temperature-display">
                            <FaThermometer className="temp-icon" />
                            <span>
                                {appointmentDetails.temperature 
                                    ? `${appointmentDetails.temperature}°C` 
                                    : 'Temperature not recorded'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="consultation-sidebar">
                    <div className="patient-info">
                        <h3>Patient Information</h3>
                        <div className="patient-details">
                            <div className="vital-signs">
                                <h4>Vital Signs</h4>
                                <div className="vital-sign-item">
                                    <FaThermometer />
                                    <span>Temperature:</span>
                                    <strong>
                                        {appointmentDetails.temperature 
                                            ? `${appointmentDetails.temperature}°C` 
                                            : 'Not recorded'}
                                    </strong>
                                </div>
                            </div>
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