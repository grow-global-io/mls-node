function calculateDistance(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371; // Earth's radius in kilometers

  const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
  };

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

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
function formatInternationalNumber(number) {
  // Use the Intl.NumberFormat object with the appropriate options for the desired format
  const formattedNumber = new Intl.NumberFormat("en-US", {
    style: "decimal",
    maximumFractionDigits: 2, // Customize this based on your requirements
    minimumFractionDigits: 2,
  }).format(number);

  return formattedNumber;
}
function calculatePercentageOfNumber(number, percentage) {
  // Check if the inputs are valid numbers
  if (typeof number !== "number" || typeof percentage !== "number") {
    const number2 = parseFloat(number);
    const percentage2 = parseFloat(percentage);
    if (isNaN(number2) || isNaN(percentage2)) {
      return "Please provide valid numbers";
    }
    const result = (percentage2 / 100) * number2;
    return result;
  }

  // Calculate the result
  const result = (percentage / 100) * number;
  return result;
}

module.exports = {
  calculateDistance,
  calculateSimilarityScore,
  formatInternationalNumber,
  calculatePercentageOfNumber,
};
