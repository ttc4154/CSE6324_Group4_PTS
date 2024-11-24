import React, { useState } from 'react';
import '../styles/TutorRating.css'; // Add styles if needed
const TutorRating = ({ tutorId, onSubmitRating }) => {
    const [rating, setRating] = useState(0);

    const handleRatingClick = (newRating) => {
        setRating(newRating);
    };

    const handleSubmit = () => {
        if (rating > 0) {
            onSubmitRating(rating);
        } else {
            alert('Please select a rating before submitting.');
        }
    };

    return (
        <div className="tutor-rating">
            <p>Rate this tutor:</p>
            <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`star ${star <= rating ? 'selected' : ''}`}
                        onClick={() => handleRatingClick(star)}
                    >
                        ★
                    </span>
                ))}
            </div>
            <button onClick={handleSubmit}>Submit Rating</button>
        </div>
    );
};

export default TutorRating;
