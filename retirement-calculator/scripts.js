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
    dobInput.value = "1994-06-10";
    const defaultDob = new Date(dobInput.value);
    const defaultRetirementDate = new Date(defaultDob.setFullYear(defaultDob.getFullYear() + 60));
    exitDateInput.value = defaultRetirementDate.toISOString().substring(0, 10);
});

function calculateYearsOfService(entryDate, exitDate) {
    const entry = new Date(entryDate);
    const exit = new Date(exitDate);
    return (exit - entry) / (1000 * 60 * 60 * 24 * 365.25);
}

function calculateLast60MonthsSalary(currentSalary, growthRate, yearsOfService) {
    const salaryAtRetirement = currentSalary * Math.pow(1 + growthRate / 100, yearsOfService);
    let salaries = [];
    for (let n = 0; n < 60; n++) {
        let monthSalary = salaryAtRetirement * Math.pow(1 + growthRate / 100, -n / 12);
        monthSalary = Math.min(monthSalary, 15000); // Cap at 15000
        salaries.push(monthSalary);
    }
    const totalSalary = salaries.reduce((acc, salary) => acc + salary, 0);
    return totalSalary / 60;
}

function calculatePensionableSalary(currentSalary, growthRate, yearsOfService) {
    return calculateLast60MonthsSalary(currentSalary, growthRate, yearsOfService);
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

function calculatePfPensionFund(currentSalary, pfReturn, years, growthRate) {
    let accumulatedPfPensionFund = 0;
    for (let year = 0; year < years; year++) {
        const salary = calculateSalaryGrowth(currentSalary, growthRate, year);
        const monthlyEPSContribution = Math.min(salary, 15000) * 0.0833;
        accumulatedPfPensionFund = calculateFutureValue(accumulatedPfPensionFund, monthlyEPSContribution * 12, pfReturn, 1);
    }
    return Math.ceil(accumulatedPfPensionFund);
}

function calculatePfCorpus(currentSalary, pfContribution, currentPfBalance, pfReturn, years, growthRate) {
    let accumulatedPfCorpus = currentPfBalance || 0;
    for (let year = 0; year < years; year++) {
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

function calculateRequiredMonthlyExpense(currentExpense, inflationRate, yearsTillRetirement, expenseFactor) {
    const futureExpense = currentExpense * Math.pow(1 + inflationRate / 100, yearsTillRetirement);
    return Math.ceil(futureExpense * expenseFactor);
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

function calculateFIRENumber(currentExpense, inflationRate, annuityReturn, retirementAge, lifeExpectancy) {
    const yearlyExpenses = [];
    let expense = currentExpense * 12; // Convert to yearly expense
    for (let age = retirementAge; age <= lifeExpectancy; age++) {
        yearlyExpenses.push({ age, expense });
        expense *= (1 + inflationRate / 100);
    }

    let fireNumber = 0;
    for (let i = yearlyExpenses.length - 1; i >= 0; i--) {
        // fireNumber = (fireNumber + yearlyExpenses[i].expense) / (1 + annuityReturn / 100);
        fireNumber = (fireNumber + calculatePresentValue(yearlyExpenses[i].expense,annuityReturn,yearlyExpenses[i].age-retirementAge));
    }

    return { fireNumber: Math.ceil(fireNumber), yearlyExpenses };
}

function convertDecimalYears(decimalYears) {
    const totalDays = Math.floor(decimalYears * 365.25);
    const years = Math.floor(totalDays / 365.25);
    const remainingDays = totalDays % 365.25;
    const months = Math.floor(remainingDays / 30.4375);
    const days = Math.round(remainingDays % 30.4375);

    return { years, months, days };
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
    const lifeExpectancy = parseFloat(document.getElementById('lifeExpectancy').value) || 0;
    const dob = new Date(document.getElementById('dob').value);
    const exitDateObject = new Date(exitDate);
    const retirementAge = exitDateObject.getFullYear() - dob.getFullYear();
    const yearsTillRetirement = calculateYearsOfService(new Date(), exitDate);
    const yearsOfService = calculateYearsOfService(entryDate, exitDate);
    
    const pensionableSalary = calculatePensionableSalary(currentSalary, growthRate, yearsTillRetirement);
    const pfPensionFund = calculatePfPensionFund(currentSalary, pfReturn, yearsTillRetirement, growthRate);
    const pfCorpus = calculatePfCorpus(currentSalary, pfContribution, currentPfBalance, pfReturn, yearsTillRetirement, growthRate);
    const epsPension = calculateEpsPension(pensionableSalary, yearsOfService);
    const npsCorpus = calculateNpsCorpus(npsContribution, npsReturn, yearsTillRetirement);
    const npsAnnuityCorpus = Math.ceil(npsCorpus * npsAnnuity);
    const npsLumpSum = Math.ceil(npsCorpus * (1 - npsAnnuity));
    const npsPension = calculateNpsPension(npsAnnuityCorpus, annuityReturn);
    let otherInvestmentCorpus = calculateOtherInvestmentCorpus(monthlyOtherInvestment, otherReturn, yearsTillRetirement);
    const capitalGainTax = calculateCapitalGainTax(otherInvestmentCorpus, capitalGainTaxRate);
    otherInvestmentCorpus -= capitalGainTax;
    const totalLumpSum = Math.ceil((pfCorpus || 0) + (npsLumpSum || 0) + (otherInvestmentCorpus || 0));
    const totalPension = Math.ceil((epsPension || 0) + (npsPension || 0));
    const totalLumpSumPresent = Math.ceil(calculatePresentValue(totalLumpSum, inflationRate, yearsTillRetirement));
    const totalPensionPresent = Math.ceil(calculatePresentValue(totalPension * 12, inflationRate, yearsTillRetirement) / 12);
    const requiredMonthlyExpenseFuture = calculateRequiredMonthlyExpense(currentExpense, inflationRate, yearsTillRetirement, expenseFactor);
    const fireDetails = calculateFIRENumber(requiredMonthlyExpenseFuture, inflationRate, annuityReturn, retirementAge, lifeExpectancy);
    const fireNumber = fireDetails.fireNumber;
    const allowedNps = Math.min(currentSalary * 0.1, 150000/12)+(50000/12);
    
    var requiredNpsInvestment = 0;
    var requiredOtherInvestment = 0;
    if(fireNumber > totalLumpSum){
        requiredNpsInvestment = calculateMonthlyInvestment(fireNumber-totalLumpSum, yearsTillRetirement, npsReturn);
        const scopeInNPS = allowedNps - npsContribution;
        var maxNPS = 0;
        if(scopeInNPS < requiredNpsInvestment){
            maxNPS = calculateFutureValue(0,scopeInNPS*12, npsReturn, yearsTillRetirement);
            requiredNpsInvestment = scopeInNPS;
            const otherInvestment = fireNumber-totalLumpSum-maxNPS;
            requiredOtherInvestment = calculateMonthlyInvestment(otherInvestment/(1-(capitalGainTaxRate/100)), yearsTillRetirement, otherReturn);
        }
    }

    document.getElementById('result').innerHTML = `
        <div class="section lump-sum-section">
            <h2>Retirement Corpus</h2>
            <p>PF Corpus: ${formatCurrency(pfCorpus)}</p>
            <p>NPS Corpus: ${formatCurrency(npsLumpSum)}</p>
            <p>Other Investment Corpus: ${formatCurrency(otherInvestmentCorpus)}</p>
            <p>Capital Gain Tax: ${formatCurrency(capitalGainTax)}</p>
            <p><strong>Total Corpus: ${formatCurrency(totalLumpSum)}</strong></p>
            <p>Present Value of Total Corpus: ${formatCurrency(totalLumpSumPresent)}</p>
        </div>
        
        <div class="section pension-section">
            <h2>Pension</h2>
            <p>EPS Pension: ${formatCurrency(epsPension)}</p>
            <p>NPS Pension: ${formatCurrency(npsPension)}</p>
            <p><strong>Total Pension: ${formatCurrency(totalPension)}</strong></p>
            <p>Present Value of Total Pension: ${formatCurrency(totalPensionPresent)}</p>
        </div>

        <div class="section expense-section">
            <h2>FIRE(Financial Independence, Retire Early)</h2>
            <p>Time Left to Retire: ${convertDecimalYears(yearsTillRetirement).years} Years, ${convertDecimalYears(yearsTillRetirement).months} Months </p>
            <p>Future Salary: ${formatCurrency(calculateSalaryGrowth(fullSalary, growthRate, yearsTillRetirement))}</p>
            <p>Future Monthly Expense: ${formatCurrency(requiredMonthlyExpenseFuture)}</p>
            <p><strong>FIRE Number(Considering Pension): ${formatCurrency(fireNumber)}</strong></p>
            ${fireNumber > totalLumpSum ? `
            <p class="shortage"><strong>Shortage in Corpus: ${formatCurrency(fireNumber - totalLumpSum)}</strong></p>
            <p><strong>Need Monthly NPS Investment(Till Retirement, tax exempted): ${formatCurrency(requiredNpsInvestment)}</strong></p>
            <p><strong>Need Other Investment(Till Retirement, taxable): ${formatCurrency(requiredOtherInvestment)}</strong></p>` : `
            <p class="surplus">Surplus of Corpus: ${formatCurrency(totalLumpSum - fireNumber)}</p>`}
        </div>
        <div class="section">
            <p class="disclaimer">Note:Your maximum tax-exempt monthly NPS investment is ${formatCurrency(allowedNps)}</p>
        </div>
    `;

    let detailsTable = '<h2>Details</h2><table><tr><th>Age</th><th>Annual Expense</th></tr>';
    fireDetails.yearlyExpenses.forEach(detail => {
        detailsTable += `<tr><td>${detail.age}</td><td>${formatCurrency(detail.expense)}</td></tr>`;
    });
    detailsTable += '</table>';

    document.getElementById('debug').innerHTML = detailsTable;
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
        calculateFIRENumber,
        calculateRetirement,
        convertDecimalYears
    };
}
