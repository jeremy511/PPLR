import React from 'react';
import './FirefliesBackground.css';

export const FirefliesBackground = () => {
    // Generate a fixed number of fireflies
    const fireflies = Array.from({ length: 15 });

    return (
        <div className="fireflies-container">
            {fireflies.map((_, index) => (
                <div keys={index} className="firefly"></div>
            ))}
        </div>
    );
};
