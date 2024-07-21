function calculateYearsOfService(entryDate, exitDate) {
    const entry = new Date(entryDate);
    const exit = new Date(exitDate);
    return (exit - entry) / (1000 * 60 * 60 * 24 * 365.25);
}

function calculateLast60MonthsSalary(currentSalary, growthRate) {
    let salaries = [];
    for (let n = 0; n < 60; n++) {
        let monthSalary = currentSalary * Math.pow(1 + growthRate / 100, -n / 12);
        monthSalary = Math.min(monthSalary, 15000); // Cap at 15000
        salaries.push(monthSalary);
    }
    const totalSalary = salaries.reduce((acc, salary) => acc + salary, 0);
    return totalSalary / 60;
}

function calculatePresentValue(futureValue, inflationRate, years) {
    return futureValue / Math.pow(1 + inflationRate / 100, years);
}

function calculateFutureValue(currentBalance, monthlyContribution, annualRate, years) {
    const quarterlyRate = annualRate / 4 / 100;
    const totalQuarters = years * 4;
    const quarterlyContribution = monthlyContribution * 3;
    return currentBalance * Math.pow(1 + quarterlyRate, totalQuarters) + quarterlyContribution * ((Math.pow(1 + quarterlyRate, totalQuarters) - 1) / quarterlyRate);
}

function calculatePensionableSalary(currentSalary, growthRate) {
    return calculateLast60MonthsSalary(currentSalary, growthRate);
}

function calculatePfPensionFund(currentSalary, pfReturn, yearsOfService) {
    const monthlyEPSContribution = Math.min(currentSalary, 15000) * 0.0833;
    return Math.ceil(calculateFutureValue(0, monthlyEPSContribution, pfReturn, yearsOfService));
}

function calculatePfCorpus(currentSalary, pfContribution, currentPfBalance, pfReturn, yearsOfService) {
    const monthlyEPSContribution = Math.min(currentSalary, 15000) * 0.0833;
    const monthlyPFContribution = currentSalary * pfContribution * 2 - monthlyEPSContribution; // Employee and Employer contribution minus EPS
    return Math.ceil(calculateFutureValue(currentPfBalance, monthlyPFContribution, pfReturn, yearsOfService));
}

function calculateEpsPension(pensionableSalary, yearsOfService) {
    return Math.ceil((pensionableSalary * yearsOfService) / 70);
}

function calculateNpsCorpus(npsContribution, npsReturn, yearsOfService) {
    return Math.ceil(calculateFutureValue(0, npsContribution, npsReturn, yearsOfService));
}

function calculateNpsPension(npsAnnuityCorpus, annuityReturn) {
    return Math.ceil(npsAnnuityCorpus * annuityReturn / 12);
}

function calculateOtherInvestmentCorpus(monthlyOtherInvestment, otherReturn, yearsOfService) {
    return Math.ceil(calculateFutureValue(0, monthlyOtherInvestment, otherReturn, yearsOfService));
}

function calculateRequiredMonthlyExpense(currentExpense, inflationRate, yearsOfService, expenseFactor) {
    const futureExpense = currentExpense * Math.pow(1 + inflationRate / 100, yearsOfService);
    return Math.ceil(futureExpense * expenseFactor);
}

function calculateRequiredNpsInvestment(shortageInPension, npsReturn, yearsOfService) {
    if (shortageInPension > 0) {
        return Math.ceil((shortageInPension * 12 * (Math.pow(1 + npsReturn / 12 / 100, yearsOfService * 12) - 1)) / (npsReturn / 12 / 100 * Math.pow(1 + npsReturn / 12 / 100, yearsOfService * 12)));
    }
    return 0;
}

function formatCurrency(value) {
    return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

function calculateRetirement() {
    const entryDate = document.getElementById('entryDate').value;
    const exitDate = document.getElementById('exitDate').value;
    const currentSalary = Math.ceil(parseFloat(document.getElementById('currentSalary').value));
    const growthRate = parseFloat(document.getElementById('growthRate').value);
    const inflationRate = parseFloat(document.getElementById('inflationRate').value);
    const pfContribution = parseFloat(document.getElementById('pfContribution').value) / 100;
    const pfReturn = parseFloat(document.getElementById('pfReturn').value);
    const npsContribution = Math.ceil(parseFloat(document.getElementById('npsContribution').value));
    const npsReturn = parseFloat(document.getElementById('npsReturn').value);
    const npsAnnuity = parseFloat(document.getElementById('npsAnnuity').value) / 100;
    const annuityReturn = parseFloat(document.getElementById('annuityReturn').value);
    const currentPfBalance = Math.ceil(parseFloat(document.getElementById('currentPfBalance').value));
    const monthlyOtherInvestment = Math.ceil(parseFloat(document.getElementById('monthlyOtherInvestment').value));
    const otherReturn = parseFloat(document.getElementById('otherReturn').value);
    const currentExpense = Math.ceil(parseFloat(document.getElementById('currentExpense').value));
    const expenseFactor = parseFloat(document.getElementById('expenseFactor').value);

    const yearsOfService = calculateYearsOfService(entryDate, exitDate);
    const pensionableSalary = calculatePensionableSalary(currentSalary, growthRate);
    const pfPensionFund = calculatePfPensionFund(currentSalary, pfReturn, yearsOfService);
    const pfCorpus = calculatePfCorpus(currentSalary, pfContribution, currentPfBalance, pfReturn, yearsOfService);
    const epsPension = calculateEpsPension(pensionableSalary, yearsOfService);
    const npsCorpus = calculateNpsCorpus(npsContribution, npsReturn, yearsOfService);
    const npsAnnuityCorpus = Math.ceil(npsCorpus * npsAnnuity);
    const npsLumpSum = Math.ceil(npsCorpus * (1 - npsAnnuity));
    const npsPension = calculateNpsPension(npsAnnuityCorpus, annuityReturn);
    const otherInvestmentCorpus = calculateOtherInvestmentCorpus(monthlyOtherInvestment, otherReturn, yearsOfService);
    const totalLumpSum = Math.ceil(pfCorpus + npsLumpSum + otherInvestmentCorpus);
    const totalPension = Math.ceil(epsPension + npsPension);
    const totalLumpSumPresent = Math.ceil(calculatePresentValue(totalLumpSum, inflationRate, yearsOfService));
    const totalPensionPresent = Math.ceil(calculatePresentValue(totalPension * 12, inflationRate, yearsOfService) / 12);
    const requiredMonthlyExpenseFuture = calculateRequiredMonthlyExpense(currentExpense, inflationRate, yearsOfService, expenseFactor);
    const shortageInPension = requiredMonthlyExpenseFuture - totalPension;
    const requiredNpsInvestment = calculateRequiredNpsInvestment(shortageInPension, npsReturn, yearsOfService);

    document.getElementById('result').innerHTML = `
        <p>Exit Date: ${exitDate}</p>
        <p>PF Corpus: ${formatCurrency(pfCorpus)}</p>
        <p>NPS Lump Sum: ${formatCurrency(npsLumpSum)}</p>
        <p>NPS Pension: ${formatCurrency(npsPension)}</p>
        <p>EPS Pension: ${formatCurrency(epsPension)}</p>
        <p>Other Investment Corpus: ${formatCurrency(otherInvestmentCorpus)}</p>
        <p><strong>Total Lump Sum: ${formatCurrency(totalLumpSum)}</strong></p>
        <p><strong>Total Pension: ${formatCurrency(totalPension)}</strong></p>
        <p><strong>Present Value of Total Lump Sum: ${formatCurrency(totalLumpSumPresent)}</strong></p>
        <p><strong>Present Value of Total Pension: ${formatCurrency(totalPensionPresent)}</strong></p>
        <p><strong>Required Monthly Expense after Retirement (Future Value): ${formatCurrency(requiredMonthlyExpenseFuture)}</strong></p>
        ${shortageInPension > 0 ? `<p><strong>Shortage in Pension: ${formatCurrency(shortageInPension)}</strong></p>
        <p><strong>Required Monthly Investment in NPS: ${formatCurrency(requiredNpsInvestment)}</strong></p>` : ''}
    `;

    document.getElementById('debug').innerHTML = `
        <h2>Behind the Scene</h2>
        <p>Years of Service: ${yearsOfService.toFixed(2)}</p>
        <p>Pensionable Salary (Last 60 Months Average): ₹${pensionableSalary.toFixed(2)}</p>
        <p>Monthly EPS Contribution: ₹${Math.min(currentSalary, 15000) * 0.0833}</p>
        <p>Monthly PF Contribution (excluding EPS): ₹${currentSalary * pfContribution * 2 - Math.min(currentSalary, 15000) * 0.0833}</p>
        <p>Future Value of PF Pension Fund: ₹${pfPensionFund.toFixed(2)}</p>
        <p>Future Value of PF Corpus: ₹${pfCorpus.toFixed(2)}</p>
        <p>Future Value of NPS Corpus: ₹${npsCorpus.toFixed(2)}</p>
        <p>NPS Annuity Corpus: ₹${npsAnnuityCorpus.toFixed(2)}</p>
        <p>NPS Lump Sum: ₹${npsLumpSum.toFixed(2)}</p>
        <p>NPS Pension: ₹${npsPension.toFixed(2)}</p>
        <p>EPS Pension: ₹${epsPension.toFixed(2)}</p>
        <p>Future Value of Other Investments: ₹${otherInvestmentCorpus.toFixed(2)}</p>
        <p>Total Lump Sum: ₹${totalLumpSum.toFixed(2)}</p>
        <p>Total Monthly Pension: ₹${totalPension.toFixed(2)}</p>
        <p>Present Value of Total Lump Sum: ₹${totalLumpSumPresent.toFixed(2)}</p>
        <p>Present Value of Total Pension: ₹${totalPensionPresent.toFixed(2)}</p>
        <p>Required Monthly Expense after Retirement (Future Value): ₹${requiredMonthlyExpenseFuture.toFixed(2)}</p>
        <p>Shortage in Pension: ₹${shortageInPension.toFixed(2)}</p>
        <p>Required Monthly Investment in NPS: ₹${requiredNpsInvestment.toFixed(2)}</p>
    `;
}

// Export functions for Node.js environment (test environment)
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        calculateYearsOfService,
        calculateLast60MonthsSalary,
        calculatePresentValue,
        calculateFutureValue,
        calculatePensionableSalary,
        calculatePfPensionFund,
        calculatePfCorpus,
        calculateEpsPension,
        calculateNpsCorpus,
        calculateNpsPension,
        calculateOtherInvestmentCorpus,
        calculateRequiredMonthlyExpense,
        calculateRequiredNpsInvestment,
        formatCurrency,
        calculateRetirement
    };
}
