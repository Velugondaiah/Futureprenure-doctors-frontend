import React, { useEffect, useRef, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import './index.css';

const VideoConsultation = () => {
    const { appointmentId } = useParams();
    const history = useHistory();
    const [error, setError] = useState(null);
    const localVideoRef = useRef();

    useEffect(() => {
        startLocalVideo();
        return () => {
            // Cleanup
            if (localVideoRef.current?.srcObject) {
                localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startLocalVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
        } catch (err) {
            setError(`Failed to access camera: ${err.message}`);
        }
    };

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <button onClick={() => history.goBack()}>Go Back</button>
            </div>
        );
    }

    return (
        <div className="video-consultation-container">
            <div className="video-grid">
                <div className="video-wrapper">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                    />
                </div>
            </div>
        </div>
    );
};

export default VideoConsultation; 