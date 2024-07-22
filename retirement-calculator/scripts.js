document.addEventListener('DOMContentLoaded', function () {
    const dobInput = document.getElementById('dob');
    const entryDateInput = document.getElementById('entryDate');
    const exitDateInput = document.getElementById('exitDate');

    dobInput.addEventListener('change', function () {
        const dob = new Date(dobInput.value);
        const retirementDate = new Date(dob.setFullYear(dob.getFullYear() + 60));
        exitDateInput.value = retirementDate.toISOString().substring(0, 10);
    });

    // Set default values for DoB and exit date
    dobInput.value = "1987-06-10";
    const defaultDob = new Date(dobInput.value);
    const defaultRetirementDate = new Date(defaultDob.setFullYear(defaultDob.getFullYear() + 60));
    exitDateInput.value = defaultRetirementDate.toISOString().substring(0, 10);
});

function calculateYearsOfService(entryDate, exitDate) {
    const entry = new Date(entryDate);
    const exit = new Date(exitDate);
    return (exit - entry) / (1000 * 60 * 60 * 24 * 365.25);
}

function calculateLast60MonthsSalary(currentSalary, growthRate) {
    let salaries = [];
    for (let n = 0; n < 60; n++) {
        let monthSalary;
        if (growthRate === 0) {
            monthSalary = currentSalary;
        } else {
            monthSalary = currentSalary * Math.pow(1 + growthRate / 100, -n / 12);
        }
        monthSalary = Math.min(monthSalary, 15000); // Cap at 15000
        salaries.push(monthSalary);
    }
    const totalSalary = salaries.reduce((acc, salary) => acc + salary, 0);
    return totalSalary / 60;
}

function calculatePensionableSalary(currentSalary, growthRate) {
    return calculateLast60MonthsSalary(currentSalary, growthRate);
}

function calculatePresentValue(futureValue, inflationRate, years) {
    return futureValue / Math.pow(1 + inflationRate / 100, years);
}

function calculateFutureValue(currentBalance, annualContribution, annualRate, years) {
    return currentBalance * Math.pow(1 + annualRate / 100, years) + annualContribution * ((Math.pow(1 + annualRate / 100, years) - 1) / (annualRate / 100));
}

function calculateSalaryGrowth(currentSalary, growthRate, years) {
    return currentSalary * Math.pow(1 + growthRate / 100, years);
}

function calculatePfPensionFund(currentSalary, pfReturn, yearsOfService, growthRate) {
    let accumulatedPfPensionFund = 0;
    for (let year = 0; year < yearsOfService; year++) {
        const salary = calculateSalaryGrowth(currentSalary, growthRate, year);
        const monthlyEPSContribution = Math.min(salary, 15000) * 0.0833;
        accumulatedPfPensionFund = calculateFutureValue(accumulatedPfPensionFund, monthlyEPSContribution * 12, pfReturn, 1);
    }
    return Math.ceil(accumulatedPfPensionFund);
}

function calculatePfCorpus(currentSalary, pfContribution, currentPfBalance, pfReturn, yearsOfService, growthRate) {
    let accumulatedPfCorpus = currentPfBalance || 0;
    for (let year = 0; year < yearsOfService; year++) {
        const salary = calculateSalaryGrowth(currentSalary, growthRate, year);
        const monthlyEPSContribution = Math.min(salary, 15000) * 0.0833;
        const monthlyPFContribution = salary * pfContribution * 2 - monthlyEPSContribution;
        accumulatedPfCorpus = calculateFutureValue(accumulatedPfCorpus, monthlyPFContribution * 12, pfReturn, 1);
    }
    return Math.ceil(accumulatedPfCorpus);
}

function calculateEpsPension(pensionableSalary, yearsOfService) {
    return Math.ceil((pensionableSalary * yearsOfService) / 70);
}

function calculateNpsCorpus(npsContribution, npsReturn, yearsOfService) {
    return Math.ceil(calculateFutureValue(0, npsContribution * 12, npsReturn, yearsOfService));
}

function calculateNpsPension(npsAnnuityCorpus, annuityReturn) {
    return Math.ceil(npsAnnuityCorpus * (annuityReturn / 100) / 12);
}

function calculateOtherInvestmentCorpus(monthlyOtherInvestment, otherReturn, yearsOfService) {
    if (monthlyOtherInvestment === 0 || otherReturn === 0 || yearsOfService === 0) {
        return 0;
    }
    return Math.ceil(calculateFutureValue(0, monthlyOtherInvestment * 12, otherReturn, yearsOfService));
}

function calculateCapitalGainTax(corpus, capitalGainTaxRate) {
    return (corpus * capitalGainTaxRate) / 100;
}

function calculateRequiredMonthlyExpense(currentExpense, inflationRate, yearsOfService, expenseFactor) {
    const futureExpense = currentExpense * Math.pow(1 + inflationRate / 100, yearsOfService);
    return Math.ceil(futureExpense * expenseFactor);
}

function calculateRequiredNpsInvestment(shortageInPension, annuityReturn, npsReturn, yearsOfService) {
    const targetAmount = (shortageInPension * 12) / (annuityReturn / 100);
    return calculateMonthlyInvestment(targetAmount, yearsOfService, npsReturn);
}

function calculateMonthlyInvestment(targetAmount, years, annualInterestRate) {
    const r = annualInterestRate / 100;
    const n = years;
    const fvFactor = Math.pow(1 + r, n);
    const monthlyInvestment = (targetAmount * r) / (12 * (fvFactor - 1));
    return Math.round(monthlyInvestment * 100) / 100;
}

function formatCurrency(value) {
    return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

function calculateRetirement() {
    const entryDate = document.getElementById('entryDate').value || new Date().toISOString().substring(0, 10);
    const exitDate = document.getElementById('exitDate').value || new Date(new Date().setFullYear(new Date().getFullYear() + 30)).toISOString().substring(0, 10);
    const currentSalary = Math.ceil(parseFloat(document.getElementById('currentSalary').value) || 15000);
    const fullSalary = Math.ceil(parseFloat(document.getElementById('fullSalary').value) || 20000);
    const growthRate = parseFloat(document.getElementById('growthRate').value) || 0;
    const inflationRate = parseFloat(document.getElementById('inflationRate').value) || 0;
    const pfContribution = parseFloat(document.getElementById('pfContribution').value) / 100 || 0;
    const pfReturn = parseFloat(document.getElementById('pfReturn').value) || 0;
    const npsContribution = Math.ceil(parseFloat(document.getElementById('npsContribution').value) || 0);
    const npsReturn = parseFloat(document.getElementById('npsReturn').value) || 0;
    const npsAnnuity = parseFloat(document.getElementById('npsAnnuity').value) / 100 || 0;
    const annuityReturn = parseFloat(document.getElementById('annuityReturn').value) || 0;
    const currentPfBalance = Math.ceil(parseFloat(document.getElementById('currentPfBalance').value) || 0);
    const monthlyOtherInvestment = Math.ceil(parseFloat(document.getElementById('monthlyOtherInvestment').value) || 0);
    const otherReturn = parseFloat(document.getElementById('otherReturn').value) || 0;
    const capitalGainTaxRate = parseFloat(document.getElementById('capitalGainTaxRate').value) || 0;
    const currentExpense = Math.ceil(parseFloat(document.getElementById('currentExpense').value) || 0);
    const expenseFactor = parseFloat(document.getElementById('expenseFactor').value) || 0;

    const yearsOfService = calculateYearsOfService(entryDate, exitDate);
    const pensionableSalary = calculatePensionableSalary(currentSalary, growthRate);
    const pfPensionFund = calculatePfPensionFund(currentSalary, pfReturn, yearsOfService, growthRate);
    const pfCorpus = calculatePfCorpus(currentSalary, pfContribution, currentPfBalance, pfReturn, yearsOfService, growthRate);
    const epsPension = calculateEpsPension(pensionableSalary, yearsOfService);
    const npsCorpus = calculateNpsCorpus(npsContribution, npsReturn, yearsOfService);
    const npsAnnuityCorpus = Math.ceil(npsCorpus * npsAnnuity);
    const npsLumpSum = Math.ceil(npsCorpus * (1 - npsAnnuity));
    const npsPension = calculateNpsPension(npsAnnuityCorpus, annuityReturn);
    let otherInvestmentCorpus = calculateOtherInvestmentCorpus(monthlyOtherInvestment, otherReturn, yearsOfService);
    const capitalGainTax = calculateCapitalGainTax(otherInvestmentCorpus, capitalGainTaxRate);
    otherInvestmentCorpus -= capitalGainTax;
    const totalLumpSum = Math.ceil((pfCorpus || 0) + (npsLumpSum || 0) + (otherInvestmentCorpus || 0));
    const totalPension = Math.ceil((epsPension || 0) + (npsPension || 0));
    const totalLumpSumPresent = Math.ceil(calculatePresentValue(totalLumpSum, inflationRate, yearsOfService));
    const totalPensionPresent = Math.ceil(calculatePresentValue(totalPension * 12, inflationRate, yearsOfService) / 12);
    const requiredMonthlyExpenseFuture = calculateRequiredMonthlyExpense(currentExpense, inflationRate, yearsOfService, expenseFactor);
    const shortageInPension = requiredMonthlyExpenseFuture - totalPension;
    const requiredNpsInvestment = calculateRequiredNpsInvestment(shortageInPension, annuityReturn, npsReturn, yearsOfService);

    document.getElementById('result').innerHTML = `
        <div class="lump-sum-section">
            <h2>Lump Sum</h2>
            <p>PF Corpus: ${formatCurrency(pfCorpus)}</p>
            <p>NPS Lump Sum: ${formatCurrency(npsLumpSum)}</p>
            <p>Other Investment Corpus: ${formatCurrency(otherInvestmentCorpus)}</p>
            <p>Capital Gain Tax: ${formatCurrency(capitalGainTax)}</p>
            <p><strong>Total Lump Sum: ${formatCurrency(totalLumpSum)}</strong></p>
            <p><strong>Present Value of Total Lump Sum: ${formatCurrency(totalLumpSumPresent)}</strong></p>
        </div>
        
        <div class="pension-section">
            <h2>Pension</h2>
            <p>EPS Pension: ${formatCurrency(epsPension)}</p>
            <p>NPS Pension: ${formatCurrency(npsPension)}</p>
            <p><strong>Total Pension: ${formatCurrency(totalPension)}</strong></p>
            <p><strong>Present Value of Total Pension: ${formatCurrency(totalPensionPresent)}</strong></p>
        </div>

        <div class="expense-section">
            <h2>In the Future</h2>
            <p>Future Salary: ${formatCurrency(calculateSalaryGrowth(fullSalary, growthRate, yearsOfService))}</p>
            <p><strong>Required Monthly Expense after Retirement (Future Value): ${formatCurrency(requiredMonthlyExpenseFuture)}</strong></p>
            ${shortageInPension > 0 ? `
            <p><strong>Shortage in Pension: ${formatCurrency(shortageInPension)}</strong></p>
            <p><strong>Required Monthly Investment in NPS: ${formatCurrency(requiredNpsInvestment)}</strong></p>` : ''}
        </div>
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
        <p>Capital Gain Tax: ₹${capitalGainTax.toFixed(2)}</p>
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
        calculateCapitalGainTax,
        calculateRequiredMonthlyExpense,
        calculateRequiredNpsInvestment,
        calculateMonthlyInvestment,
        formatCurrency,
        calculateRetirement
    };
}
