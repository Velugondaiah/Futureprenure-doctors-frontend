import React, { useState, useEffect, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Cookies from 'js-cookie';
import './index.css';

const VideoRoom = () => {
    // Get meeting ID and history
    const { meeting_id } = useParams();
    const history = useHistory();

    // State
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // Refs for video elements
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const localStream = useRef(null);

    const handleEndCall = () => {
        // Stop all tracks
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop());
        }
        
        // Redirect based on user type
        const isDoctor = window.location.pathname.includes('/doctor/');
        history.push(isDoctor ? '/doctor-booking-history' : '/booking-history');
    };

    const initializeCall = async () => {
        try {
            // Get local media stream
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            localStream.current = stream;
            
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

        } catch (err) {
            console.error('Error accessing media:', err);
            setError('Could not access camera and microphone');
        }
    };

    const cleanupCall = () => {
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop());
        }
    };

    useEffect(() => {
        if (!meeting_id) {
            setError('Invalid meeting ID');
            return;
        }

        initializeCall();

        // Cleanup on unmount
        return () => {
            cleanupCall();
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