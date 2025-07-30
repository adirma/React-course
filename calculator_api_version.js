(function (container, document, window) {
  'use strict';

  // Load Chart.js if not already loaded, then initialize calculator
  if (typeof Chart === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = () => {
      initializeCalculator();
    };
    document.head.appendChild(script);
  } else {
    initializeCalculator();
  }

  function initializeCalculator() {
    // API Configuration
    const API_BASE_URL = 'https://orpinnes5.wixstudio.com/my-site-2/_functions';
    
    // Global variables for data and charts
    let uniformLifetimeTable = {};
    let combinedChart = null;
    let rmdChart = null;
    let isDataLoaded = false;

    // Create calculator container
    const calculatorDiv = document.createElement('div');
    calculatorDiv.className = 'rmd-calculator';
    calculatorDiv.style.cssText = `
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          background-color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
      `;

    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(255, 255, 255, 0.9);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          font-size: 16px;
          color: #0066cc;
      `;
    loadingOverlay.textContent = 'Loading calculator data...';

    // Create header
    const header = document.createElement('div');
    header.className = 'calculator-header';
    header.style.cssText = `
          background-color: #e8e8e8;
          padding: 15px 20px;
          border-bottom: 1px solid #ddd;
          display: flex;
          justify-content: space-between;
          align-items: center;
      `;

    const headerTitle = document.createElement('h1');
    headerTitle.textContent = 'RMD (Lifetime Required Distributions: Traditional IRAs) Calculator - API Version';
    headerTitle.style.cssText = `
          font-size: 18px;
          font-weight: normal;
          color: #333;
          margin: 0;
      `;

    const headerLogo = document.createElement('div');
    headerLogo.textContent = 'Broadridge';
    headerLogo.style.cssText = `
          font-size: 14px;
          color: #666;
      `;

    header.appendChild(headerTitle);
    header.appendChild(headerLogo);

    // Create main container
    const mainContainer = document.createElement('div');
    mainContainer.style.cssText = `
          display: flex;
          min-height: 600px;
          position: relative;
      `;

    // Create sidebar
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    sidebar.style.cssText = `
          width: 280px;
          background-color: white;
          border-right: 1px solid #ddd;
          padding: 20px;
      `;

    // Create sidebar title
    const sidebarTitle = document.createElement('div');
    sidebarTitle.textContent = 'Details';
    sidebarTitle.style.cssText = `
          font-size: 16px;
          font-weight: bold;
          color: #0066cc;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #eee;
      `;

    // Create form
    const form = document.createElement('form');

    // Helper function to create form groups
    const createFormGroup = (labelText, inputType, inputId, options = {}) => {
      const formGroup = document.createElement('div');
      formGroup.style.cssText = 'margin-bottom: 20px;';

      const label = document.createElement('label');
      label.textContent = labelText;
      label.setAttribute('for', inputId);
      label.style.cssText = `
              display: block;
              margin-bottom: 5px;
              font-size: 13px;
              color: #333;
          `;

      let input;
      if (inputType === 'select') {
        input = document.createElement('select');
        options.options.forEach(option => {
          const optionElement = document.createElement('option');
          optionElement.value = option.value;
          optionElement.textContent = option.text;
          if (option.selected) optionElement.selected = true;
          input.appendChild(optionElement);
        });
      } else {
        input = document.createElement('input');
        input.type = inputType;
        if (options.value) input.value = options.value;
        if (options.readonly) input.readOnly = true;
        if (options.min) input.min = options.min;
        if (options.max) input.max = options.max;
      }

      input.id = inputId;
      input.style.cssText = `
              width: 100%;
              padding: 8px;
              border: 1px solid #ccc;
              border-radius: 3px;
              font-size: 13px;
              box-sizing: border-box;
          `;

      input.addEventListener('focus', () => {
        input.style.outline = 'none';
        input.style.borderColor = '#0066cc';
      });

      input.addEventListener('blur', () => {
        input.style.borderColor = '#ccc';
      });

      formGroup.appendChild(label);
      formGroup.appendChild(input);
      
      return { formGroup, input };
    };

    // Create form fields
    const annualReturnField = createFormGroup('Assumed annual rate of return', 'select', 'annualReturn', {
      options: [
        { value: '3', text: '3%' },
        { value: '4', text: '4%' },
        { value: '5', text: '5%' },
        { value: '6', text: '6%', selected: true },
        { value: '7', text: '7%' },
        { value: '8', text: '8%' },
        { value: '9', text: '9%' },
        { value: '10', text: '10%' }
      ]
    });

    const balanceField = createFormGroup('Starting balance', 'text', 'iraBalance', {
      value: '$ 100000',
      readonly: true
    });

    const ageField = createFormGroup('Current age (Age on December 31 of current year)', 'number', 'currentAge', {
      value: '70',
      min: '18',
      max: '80'
    });

    // Create calculate button
    const calculateBtn = document.createElement('button');
    calculateBtn.textContent = 'Calculate';
    calculateBtn.type = 'submit';
    calculateBtn.style.cssText = `
          background-color: #0066cc;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 3px;
          font-size: 13px;
          cursor: pointer;
          margin-top: 10px;
      `;

    calculateBtn.addEventListener('mouseover', () => {
      calculateBtn.style.backgroundColor = '#0056b3';
    });

    calculateBtn.addEventListener('mouseout', () => {
      calculateBtn.style.backgroundColor = '#0066cc';
    });

    // Create note section
    const noteSection = document.createElement('div');
    noteSection.style.cssText = `
          margin-top: 30px;
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 3px;
          font-size: 12px;
          line-height: 1.4;
      `;

    const noteTitle = document.createElement('h4');
    noteTitle.textContent = 'Note';
    noteTitle.style.cssText = `
          font-size: 13px;
          margin-bottom: 8px;
          color: #333;
          margin-top: 0;
      `;

    const noteText = document.createElement('p');
    noteText.textContent = 'The general RMD starting age is age 73 (if attain age 72 after 2022 and age 73 before 2033), then increases to age 75 thereafter. Calculations are based on the Uniform Lifetime Table provided in the 2020 final IRS regulations. Special rules apply if your spouse is 10 or more years younger than you and is your sole designated beneficiary. The calculator is intended to be used by the IRA owner (not an IRA beneficiary). Data is loaded from external API.';
    noteText.style.cssText = 'margin: 0;';

    noteSection.appendChild(noteTitle);
    noteSection.appendChild(noteText);

    // Assemble sidebar
    form.appendChild(annualReturnField.formGroup);
    form.appendChild(balanceField.formGroup);
    form.appendChild(ageField.formGroup);
    form.appendChild(calculateBtn);

    sidebar.appendChild(sidebarTitle);
    sidebar.appendChild(form);
    sidebar.appendChild(noteSection);

    // Create content area
    const content = document.createElement('div');
    content.style.cssText = `
          flex: 1;
          padding: 20px;
          background-color: white;
      `;

    // Create content sections
    const howItWorksTitle = document.createElement('div');
    howItWorksTitle.textContent = 'How it is Calculated';
    howItWorksTitle.style.cssText = `
          font-size: 16px;
          font-weight: bold;
          color: #0066cc;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #eee;
      `;

    const description = document.createElement('p');
    description.textContent = 'This tool calculates the lifetime required minimum distribution (RMD) amounts for a traditional IRA using data from external API. Two charts will be generated, one illustrating both account growth (until your required beginning date) and RMD amounts over time, the other simply illustrating RMD amounts over time. The current year is assumed to be 2025.';
    description.style.cssText = `
          font-size: 12px;
          color: #666;
          margin-bottom: 15px;
          line-height: 1.4;
      `;

    const resultsTitle = document.createElement('div');
    resultsTitle.textContent = 'Results';
    resultsTitle.style.cssText = `
          font-size: 16px;
          font-weight: bold;
          color: #0066cc;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #eee;
      `;

    // Create results summary
    const resultsSummary = document.createElement('div');
    resultsSummary.style.cssText = `
          background-color: #e8f4fd;
          padding: 15px;
          border-radius: 3px;
          margin-bottom: 20px;
      `;

    const summaryP1 = document.createElement('p');
    summaryP1.innerHTML = 'Number of years until RMD amounts begin: <span id="yearsUntilRMD">50</span>';
    summaryP1.style.cssText = 'margin-bottom: 8px; font-size: 13px; color: #333;';

    const summaryP2 = document.createElement('p');
    summaryP2.innerHTML = 'Number of years withdrawals will occur: <span id="yearsWithdrawals">26</span>';
    summaryP2.style.cssText = 'margin-bottom: 8px; font-size: 13px; color: #333;';

    const summaryP3 = document.createElement('p');
    summaryP3.innerHTML = 'Total withdrawals: <span id="totalWithdrawals">$3,651,609</span>';
    summaryP3.style.cssText = 'margin-bottom: 0; font-size: 13px; color: #333;';

    resultsSummary.appendChild(summaryP1);
    resultsSummary.appendChild(summaryP2);
    resultsSummary.appendChild(summaryP3);

    // Create chart sections
    const chartSection1 = document.createElement('div');
    chartSection1.style.cssText = 'margin-bottom: 30px;';

    const chartTitle1 = document.createElement('h3');
    chartTitle1.textContent = 'Chart';
    chartTitle1.style.cssText = `
          font-size: 16px;
          font-weight: bold;
          color: #333;
          margin-bottom: 15px;
          margin-top: 0;
      `;

    const chartSubtitle1 = document.createElement('div');
    chartSubtitle1.innerHTML = '<strong>Required Minimum Distribution Schedule and Account Balance</strong>';
    chartSubtitle1.style.cssText = 'margin-bottom: 15px;';

    const chartContainer1 = document.createElement('div');
    chartContainer1.style.cssText = `
          position: relative;
          height: 300px;
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 3px;
          padding: 10px;
      `;

    const canvas1 = document.createElement('canvas');
    canvas1.id = 'combinedChart';
    chartContainer1.appendChild(canvas1);

    const chartDesc1 = document.createElement('p');
    chartDesc1.textContent = 'Distributions and annual growth shown through age 100.';
    chartDesc1.style.cssText = `
          font-size: 12px;
          color: #666;
          margin: 15px 0 0 0;
          line-height: 1.4;
      `;

    const chartDesc2 = document.createElement('p');
    chartDesc2.textContent = 'If you live beyond age 100, RMDs continue based on your recalculated life expectancy each year.';
    chartDesc2.style.cssText = `
          font-size: 12px;
          color: #666;
          margin: 8px 0 0 0;
          line-height: 1.4;
      `;

    chartSection1.appendChild(chartTitle1);
    chartSection1.appendChild(chartSubtitle1);
    chartSection1.appendChild(chartContainer1);
    chartSection1.appendChild(chartDesc1);
    chartSection1.appendChild(chartDesc2);

    // Second chart section
    const chartSection2 = document.createElement('div');
    chartSection2.style.cssText = 'margin-bottom: 30px;';

    const chartTitle2 = document.createElement('h3');
    chartTitle2.textContent = 'Required Minimum Distribution Amounts';
    chartTitle2.style.cssText = `
          font-size: 16px;
          font-weight: bold;
          color: #333;
          margin-bottom: 15px;
          margin-top: 0;
      `;

    const chartContainer2 = document.createElement('div');
    chartContainer2.style.cssText = `
          position: relative;
          height: 300px;
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 3px;
          padding: 10px;
      `;

    const canvas2 = document.createElement('canvas');
    canvas2.id = 'rmdChart';
    chartContainer2.appendChild(canvas2);

    const chartDesc3 = document.createElement('p');
    chartDesc3.textContent = 'This chart shows required minimum distribution (RMD) amounts over time. The calculation assumes annual compounding and is based on the supplied data shown.';
    chartDesc3.style.cssText = `
          font-size: 12px;
          color: #666;
          margin: 15px 0 0 0;
          line-height: 1.4;
      `;

    chartSection2.appendChild(chartTitle2);
    chartSection2.appendChild(chartContainer2);
    chartSection2.appendChild(chartDesc3);

    // Create table section
    const tableSection = document.createElement('div');
    tableSection.style.cssText = 'margin-top: 30px;';

    const tableTitle = document.createElement('h3');
    tableTitle.textContent = 'Table';
    tableTitle.style.cssText = `
          font-size: 16px;
          font-weight: bold;
          color: #333;
          margin-bottom: 15px;
          margin-top: 0;
      `;

    const table = document.createElement('table');
    table.style.cssText = `
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          background-color: white;
          border: 1px solid #ddd;
      `;

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = ['Year', 'Age', 'Annual factor', 'Prior year ending balance', 'Investment growth', 'Required minimum distribution (pre-tax income)', 'Current year ending balance'];
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      th.style.cssText = `
              background-color: #f8f8f8;
              padding: 8px;
              text-align: center;
              border: 1px solid #ddd;
              font-weight: bold;
              color: #333;
          `;
      headerRow.appendChild(th);
    });

    const tbody = document.createElement('tbody');
    tbody.id = 'resultsTableBody';

    thead.appendChild(headerRow);
    table.appendChild(thead);
    table.appendChild(tbody);

    tableSection.appendChild(tableTitle);
    tableSection.appendChild(table);

    // Create assumptions section
    const assumptionsSection = document.createElement('div');
    assumptionsSection.style.cssText = `
          margin-top: 30px;
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 3px;
      `;

    const assumptionsTitle = document.createElement('h4');
    assumptionsTitle.textContent = 'Assumptions';
    assumptionsTitle.style.cssText = `
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #333;
          margin-top: 0;
      `;

    const assumptions = [
      'Earnings are compounded annually.',
      'The general RMD starting age is age 73 (if attain age 72 after 2022 and age 73 before 2033), then increases to age 75 thereafter.',
      'Required withdrawals are made each year during the distribution amount each year. In any year, you can withdraw more than the required minimum. But if you withdraw less than the required minimum, you will be subject to a penalty under federal tax law.',
      'Calculations are based on the Uniform Lifetime Table provided in the 2020 final IRS regulations loaded from external API. Special rules apply if your spouse is 10 or more years younger than you and is your sole designated beneficiary.',
      'This is a hypothetical illustration only and not a projection or guarantee of any particular investment performance.'
    ];

    assumptions.forEach(assumptionText => {
      const p = document.createElement('p');
      p.textContent = assumptionText;
      p.style.cssText = `
              font-size: 12px;
              margin-bottom: 8px;
              line-height: 1.4;
          `;
      assumptionsSection.appendChild(p);
    });

    assumptionsSection.appendChild(assumptionsTitle);

    // Assemble content area
    content.appendChild(howItWorksTitle);
    content.appendChild(description);
    content.appendChild(resultsTitle);
    content.appendChild(resultsSummary);
    content.appendChild(chartSection1);
    content.appendChild(chartSection2);
    content.appendChild(tableSection);
    content.appendChild(assumptionsSection);

    // Assemble main structure
    mainContainer.appendChild(sidebar);
    mainContainer.appendChild(content);
    mainContainer.appendChild(loadingOverlay);
    calculatorDiv.appendChild(header);
    calculatorDiv.appendChild(mainContainer);

    // API Functions
    const fetchRMDData = async () => {
      const response = await fetch(`${API_BASE_URL}/getRMDData`);
      const data = await response.json();
      return data;
    };

    // Utility functions
    const getRMDStartingAge = (currentAge) => {
      const currentYear = 2025;
      const birthYear = currentYear - currentAge;
      
      if (birthYear >= 2000) {
        return 75;
      } else if (birthYear > 1959 && birthYear <= 1960) {
        return 73;
      } else {
        return 72;
      }
    };

    const getDistributionFactor = (age) => {
      return uniformLifetimeTable[age] || uniformLifetimeTable[115];
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };

    const calculateRMD = (currentAge, iraBalance, annualReturn) => {
      const results = [];
      const currentYear = 2025;
      const rmdStartingAge = getRMDStartingAge(currentAge);
      const returnRate = annualReturn / 100;
      
      let balance = iraBalance;
      let age = currentAge;
      let year = currentYear;
      let totalWithdrawals = 0;

      while (age <= 100) {
        const beginningBalance = balance;
        let rmdAmount = 0;
        let distributionFactor = 0;
        let investmentGrowth = 0;

        if (age >= rmdStartingAge) {
          distributionFactor = getDistributionFactor(age);
          rmdAmount = beginningBalance / distributionFactor;
          totalWithdrawals += rmdAmount;
          
          investmentGrowth = beginningBalance * returnRate;
          balance = beginningBalance + investmentGrowth - rmdAmount;
        } else {
          investmentGrowth = balance * returnRate;
          balance = balance + investmentGrowth;
        }

        balance = Math.max(0, balance);

        results.push({
          age: age,
          year: year,
          beginningBalance: beginningBalance,
          distributionFactor: distributionFactor,
          rmdAmount: rmdAmount,
          endingBalance: balance,
          investmentGrowth: investmentGrowth,
          isRMDYear: age >= rmdStartingAge,
          totalWithdrawals: totalWithdrawals
        });

        age++;
        year++;
      }

      return results;
    };

    const createCharts = (results) => {
      const ctx1 = canvas1.getContext('2d');
      const ctx2 = canvas2.getContext('2d');

      const years = results.map(r => r.year);
      const balances = results.map(r => r.endingBalance);
      const rmdAmounts = results.map(r => r.rmdAmount);

      if (combinedChart) combinedChart.destroy();
      if (rmdChart) rmdChart.destroy();

      combinedChart = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: years,
          datasets: [
            {
              label: 'Required minimum distribution (pre-tax income)',
              data: rmdAmounts,
              borderColor: '#0066cc',
              backgroundColor: 'rgba(0, 102, 204, 0.1)',
              tension: 0.4,
              pointRadius: 0
            },
            {
              label: 'Prior year ending balance',
              data: balances,
              borderColor: '#ffa500',
              backgroundColor: 'rgba(255, 165, 0, 0.1)',
              tension: 0.4,
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 15,
                fontSize: 11
              }
            }
          },
          scales: {
            x: {
              display: true,
              grid: { display: true, color: '#e0e0e0' },
              ticks: { fontSize: 10 }
            },
            y: {
              display: true,
              grid: { display: true, color: '#e0e0e0' },
              ticks: {
                callback: function(value) { return formatCurrency(value); },
                fontSize: 10
              }
            }
          }
        }
      });

      rmdChart = new Chart(ctx2, {
        type: 'line',
        data: {
          labels: years,
          datasets: [{
            label: 'Required minimum distribution (pre-tax income)',
            data: rmdAmounts,
            borderColor: '#0066cc',
            backgroundColor: 'rgba(0, 102, 204, 0.1)',
            tension: 0.4,
            fill: false,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { usePointStyle: true, padding: 15, fontSize: 11 }
            }
          },
          scales: {
            x: {
              display: true,
              grid: { display: true, color: '#e0e0e0' },
              ticks: { fontSize: 10 }
            },
            y: {
              display: true,
              grid: { display: true, color: '#e0e0e0' },
              ticks: {
                callback: function(value) { return formatCurrency(value); },
                fontSize: 10
              }
            }
          }
        }
      });
    };

    const populateResultsTable = (results) => {
      const tableBody = document.getElementById('resultsTableBody');
      if (!tableBody) return;
      
      tableBody.innerHTML = '';

      results.forEach(result => {
        if (result.isRMDYear) {
          const row = document.createElement('tr');
          row.style.cssText = result.age % 2 === 0 ? 'background-color: #f9f9f9;' : '';
          
          row.innerHTML = `
            <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;">${result.year}</td>
            <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;">${result.age}</td>
            <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;">${result.distributionFactor}</td>
            <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;">${formatCurrency(result.beginningBalance)}</td>
            <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;">${formatCurrency(result.investmentGrowth)}</td>
            <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;">${formatCurrency(result.rmdAmount)}</td>
            <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;">${formatCurrency(result.endingBalance)}</td>
          `;
          tableBody.appendChild(row);
        }
      });
    };

    const updateSummary = (results, currentAge) => {
      const rmdStartingAge = getRMDStartingAge(currentAge);
      const yearsUntilRMD = rmdStartingAge - currentAge;
      const yearsWithdrawals = 100 - rmdStartingAge + 1;
      const totalWithdrawals = results[results.length - 1].totalWithdrawals;

      document.getElementById('yearsUntilRMD').textContent = yearsUntilRMD;
      document.getElementById('yearsWithdrawals').textContent = yearsWithdrawals;
      document.getElementById('totalWithdrawals').textContent = formatCurrency(totalWithdrawals);
    };

    const handleFormSubmit = async (event) => {
      event.preventDefault();

      const currentAge = parseInt(ageField.input.value);
      const iraBalanceText = balanceField.input.value;
      const iraBalance = parseFloat(iraBalanceText.replace(/[$,\s]/g, ''));
      const annualReturn = parseFloat(annualReturnField.input.value);

      const results = calculateRMD(currentAge, iraBalance, annualReturn);
      updateSummary(results, currentAge);
      createCharts(results);
      populateResultsTable(results);
    };

    // Initialize data loading
    const initializeData = async () => {
      const response = await fetchRMDData();
      
      if (response.success && response.data) {
        uniformLifetimeTable = response.data.uniformLifetimeTable;
      } else {
        uniformLifetimeTable = response.uniformLifetimeTable || response;
      }
      
      isDataLoaded = true;
      loadingOverlay.style.display = 'none';
      
      setTimeout(() => {
        handleFormSubmit({ preventDefault: () => {} });
      }, 100);
    };

    // Add event listeners
    form.addEventListener('submit', handleFormSubmit);

    ageField.input.addEventListener('input', function() {
      if (this.value < 18) this.value = 18;
      if (this.value > 80) this.value = 80;
    });

    // Add calculator to container and initialize
    container.appendChild(calculatorDiv);
    initializeData();
  }
})(container, document, window); 
