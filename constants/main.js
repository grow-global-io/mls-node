function calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371; // Earth's radius in kilometers

    const toRadians = degrees => {
        return degrees * (Math.PI / 180);
    };

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = earthRadius * c; // Distance in kilometers
    return distance;
}

const calculateSimilarityScore = (data, filters) => {
    let score = 0;

    // Check each criteria for a match and increment the score accordingly
    if (data.id === filters.id) {
        score++;
    }
    if (data.propertyName === filters.propertyName) {
        score++;
    }
    if (data.userType === filters.userType) {
        score++;
    }
    // Add similar checks for other criteria...

    return score;
};



module.exports = { calculateDistance, calculateSimilarityScore };