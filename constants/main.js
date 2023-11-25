function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
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