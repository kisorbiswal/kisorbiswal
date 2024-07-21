expect.extend({
    toBeCloseTo(received, expected, precision) {
      const pass = Math.abs(received - expected) < precision;
      return {
        pass,
        message: () =>
          `expected ${received} to be close to ${expected} with precision ${precision}`,
      };
    },
  });

  
const {
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
    calculateRequiredNpsInvestment
} = require('../retirement-calculator/scripts.js');

// Mock Date
const originalDate = Date;

global.Date = jest.fn((...args) => {
    if (args.length) {
        return new originalDate(...args);
    }
    return new originalDate('2024-01-01T00:00:00Z'); // Mock current date
});

describe('Retirement Calculator Functions', () => {
    afterAll(() => {
        global.Date = originalDate;
    });

    test('calculateYearsOfService should return correct years of service', () => {
        const entryDate = '2000-01-01';
        const exitDate = '2024-01-01';
        expect(calculateYearsOfService(entryDate, exitDate)).toBeCloseTo(24, 0.01);
    });

    test('calculateLast60MonthsSalary should return correct average salary', () => {
        const currentSalary = 20000;
        const growthRate = 4;
        const expectedValue = 15000; // Assuming this is the expected capped value
        const receivedValue = calculateLast60MonthsSalary(currentSalary, growthRate);
        expect(receivedValue).toBeCloseTo(expectedValue, 0.01);
    });

    test('calculatePresentValue should return correct present value', () => {
        const futureValue = 1000000;
        const inflationRate = 4;
        const years = 24;
        const expectedValue = 390121.47;
        const receivedValue = calculatePresentValue(futureValue, inflationRate, years);
        expect(receivedValue).toBeCloseTo(expectedValue, 0.01);
    });

    test('calculateFutureValue should return correct future value', () => {
        const currentBalance = 0;
        const monthlyContribution = 1000;
        const annualRate = 8.25;
        const years = 24;
        const expectedValue = 887727.06;
        const receivedValue = calculateFutureValue(currentBalance, monthlyContribution, annualRate, years);
        expect(receivedValue).toBeCloseTo(expectedValue, 10000);
    });

    test('calculateFutureValue with current balance should return correct future value', () => {
        const currentBalance = 50000;
        const monthlyContribution = 1000;
        const annualRate = 8.25;
        const years = 24;
        const expectedValue = 1235752.26;
        const receivedValue = calculateFutureValue(currentBalance, monthlyContribution, annualRate, years);
        expect(receivedValue).toBeCloseTo(expectedValue, 10000);
    });

    test('calculatePensionableSalary should return correct pensionable salary', () => {
        const currentSalary = 20000;
        const growthRate = 4;
        const expectedValue = calculateLast60MonthsSalary(currentSalary, growthRate);
        const receivedValue = calculatePensionableSalary(currentSalary, growthRate);
        expect(receivedValue).toBeCloseTo(expectedValue, 0.01);
    });

    test('calculatePfPensionFund should return correct PF pension fund', () => {
        const currentSalary = 20000;
        const pfReturn = 8.25;
        const yearsOfService = 24;
        const monthlyEPSContribution = Math.min(currentSalary, 15000) * 0.0833;
        const expectedValue = Math.ceil(calculateFutureValue(0, monthlyEPSContribution, pfReturn, yearsOfService));
        const receivedValue = calculatePfPensionFund(currentSalary, pfReturn, yearsOfService);
        expect(receivedValue).toBeCloseTo(expectedValue, 0.01);
    });

    test('calculatePfCorpus should return correct PF corpus', () => {
        const currentSalary = 20000;
        const pfContribution = 0.12;
        const currentPfBalance = 50000;
        const pfReturn = 8.25;
        const yearsOfService = 24;
        const monthlyEPSContribution = Math.min(currentSalary, 15000) * 0.0833;
        const monthlyPFContribution = currentSalary * pfContribution * 2 - monthlyEPSContribution;
        const expectedValue = Math.ceil(calculateFutureValue(currentPfBalance, monthlyPFContribution, pfReturn, yearsOfService));
        const receivedValue = calculatePfCorpus(currentSalary, pfContribution, currentPfBalance, pfReturn, yearsOfService);
        expect(receivedValue).toBeCloseTo(expectedValue, 0.01);
    });

    test('calculateEpsPension should return correct EPS pension', () => {
        const pensionableSalary = 15000;
        const yearsOfService = 24;
        const expectedValue = Math.ceil((pensionableSalary * yearsOfService) / 70);
        const receivedValue = calculateEpsPension(pensionableSalary, yearsOfService);
        expect(receivedValue).toBeCloseTo(expectedValue, 0.01);
    });

    test('calculateNpsCorpus should return correct NPS corpus', () => {
        const npsContribution = 1000;
        const npsReturn = 8.25;
        const yearsOfService = 24;
        const expectedValue = Math.ceil(calculateFutureValue(0, npsContribution, npsReturn, yearsOfService));
        const receivedValue = calculateNpsCorpus(npsContribution, npsReturn, yearsOfService);
        expect(receivedValue).toBeCloseTo(expectedValue, 0.01);
    });

    test('calculateNpsPension should return correct NPS pension', () => {
        const npsAnnuityCorpus = 500000;
        const annuityReturn = 6;
        const expectedValue = Math.ceil(npsAnnuityCorpus * annuityReturn / 12);
        const receivedValue = calculateNpsPension(npsAnnuityCorpus, annuityReturn);
        expect(receivedValue).toBeCloseTo(expectedValue, 0.01);
    });

    test('calculateOtherInvestmentCorpus should return correct other investment corpus', () => {
        const monthlyOtherInvestment = 1000;
        const otherReturn = 8.25;
        const yearsOfService = 24;
        const expectedValue = Math.ceil(calculateFutureValue(0, monthlyOtherInvestment, otherReturn, yearsOfService));
        const receivedValue = calculateOtherInvestmentCorpus(monthlyOtherInvestment, otherReturn, yearsOfService);
        expect(receivedValue).toBeCloseTo(expectedValue, 0.01);
    });
});

