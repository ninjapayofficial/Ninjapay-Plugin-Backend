// plugins/loan-plugin/utils/calculateInterest.js

function calculateInterest(transaction, endDate) {
    const { amount, interestPercent, givenDate, interestDueDate } = transaction;
  
    if (!interestPercent || !givenDate) {
      return 0;
    }
  
    const startDate = new Date(givenDate);
    let dueDate = interestDueDate ? new Date(interestDueDate) : endDate;
  
    // If dueDate is after endDate, cap it at endDate
    if (dueDate > endDate) {
      dueDate = endDate;
    }
  
    // Calculate the number of days between startDate and dueDate
    const timeDiff = dueDate.getTime() - startDate.getTime();
    if (timeDiff <= 0) {
      return 0;
    }
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
    // Get the number of days in the month
    const totalDaysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
  
    // Total interest = amount * (interestPercent / 100) * (daysDiff / totalDaysInMonth)
    const totalInterest = amount * (interestPercent / 100) * (daysDiff / totalDaysInMonth);
  
    return totalInterest;
  }
  
  function calculateDaysRemaining(transaction, endDate) {
    const { givenDate, interestDueDate } = transaction;
  
    const startDate = new Date(givenDate);
    let dueDate = interestDueDate ? new Date(interestDueDate) : endDate;
  
    // If dueDate is after endDate, cap it at endDate
    if (dueDate > endDate) {
      dueDate = endDate;
    }
  
    const timeDiff = dueDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
    return daysDiff > 0 ? daysDiff : 0;
  }
  
  module.exports = { calculateInterest, calculateDaysRemaining };
  