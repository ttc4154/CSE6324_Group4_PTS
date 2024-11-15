import React from 'react';
import { useNavigate } from 'react-router-dom';


function MyCourses() {
    const navigate = useNavigate();

    return (
        <div classname="myCourses-container">
            <h2>Courses Page</h2>
            <button onClick={() => navigate('/create-course')}>
                Create Course
            </button>
        </div>
    );
}

export default MyCourses;