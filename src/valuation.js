const marketRanges = {
  'Downtown Dubai': { 'Apartment': [2000, 3000], 'Villa': [2500, 4000] }
};

function calculateValuation(location, project, propertyType, size, bedrooms, transactions) {
  const marketRange = marketRanges[location]?.[propertyType] || [1000, 2000];
  const baseValue = size * ((marketRange[0] + marketRange[1]) / 2);
  const relevantTransactions = transactions.filter(t => t.location === location && t.property_type === propertyType);
  const avgTransactionPrice = relevantTransactions.length > 0
    ? relevantTransactions.reduce((sum, t) => sum + t.price, 0) / relevantTransactions.length
    : baseValue;
  return Math.round((baseValue * 0.7 + avgTransactionPrice * 0.3) / 10000) * 10000;
}
