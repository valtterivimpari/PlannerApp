import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import './BudgetCalculator.css';

// Register necessary chart components
Chart.register(ArcElement, Tooltip, Legend);

// Full list of world currencies as per ISO 4217 standards.
const currencyOptions = [
  { code: 'AED', label: 'AED (United Arab Emirates Dirham)' },
  { code: 'AFN', label: 'AFN (Afghan Afghani)' },
  { code: 'ALL', label: 'ALL (Albanian Lek)' },
  { code: 'AMD', label: 'AMD (Armenian Dram)' },
  { code: 'ANG', label: 'ANG (Netherlands Antillean Guilder)' },
  { code: 'AOA', label: 'AOA (Angolan Kwanza)' },
  { code: 'ARS', label: 'ARS (Argentine Peso)' },
  { code: 'AUD', label: 'AUD (Australian Dollar)' },
  { code: 'AWG', label: 'AWG (Aruban Florin)' },
  { code: 'AZN', label: 'AZN (Azerbaijani Manat)' },
  { code: 'BAM', label: 'BAM (Bosnia and Herzegovina Convertible Mark)' },
  { code: 'BBD', label: 'BBD (Barbadian Dollar)' },
  { code: 'BDT', label: 'BDT (Bangladeshi Taka)' },
  { code: 'BGN', label: 'BGN (Bulgarian Lev)' },
  { code: 'BHD', label: 'BHD (Bahraini Dinar)' },
  { code: 'BIF', label: 'BIF (Burundian Franc)' },
  { code: 'BMD', label: 'BMD (Bermudian Dollar)' },
  { code: 'BND', label: 'BND (Brunei Dollar)' },
  { code: 'BOB', label: 'BOB (Bolivian Boliviano)' },
  { code: 'BRL', label: 'BRL (Brazilian Real)' },
  { code: 'BSD', label: 'BSD (Bahamian Dollar)' },
  { code: 'BTN', label: 'BTN (Bhutanese Ngultrum)' },
  { code: 'BWP', label: 'BWP (Botswana Pula)' },
  { code: 'BYN', label: 'BYN (Belarusian Ruble)' },
  { code: 'BZD', label: 'BZD (Belize Dollar)' },
  { code: 'CAD', label: 'CAD (Canadian Dollar)' },
  { code: 'CDF', label: 'CDF (Congolese Franc)' },
  { code: 'CHF', label: 'CHF (Swiss Franc)' },
  { code: 'CLP', label: 'CLP (Chilean Peso)' },
  { code: 'CNY', label: 'CNY (Chinese Yuan)' },
  { code: 'COP', label: 'COP (Colombian Peso)' },
  { code: 'CRC', label: 'CRC (Costa Rican Colón)' },
  { code: 'CUP', label: 'CUP (Cuban Peso)' },
  { code: 'CVE', label: 'CVE (Cape Verdean Escudo)' },
  { code: 'CZK', label: 'CZK (Czech Koruna)' },
  { code: 'DJF', label: 'DJF (Djiboutian Franc)' },
  { code: 'DKK', label: 'DKK (Danish Krone)' },
  { code: 'DOP', label: 'DOP (Dominican Peso)' },
  { code: 'DZD', label: 'DZD (Algerian Dinar)' },
  { code: 'EGP', label: 'EGP (Egyptian Pound)' },
  { code: 'ERN', label: 'ERN (Eritrean Nakfa)' },
  { code: 'ETB', label: 'ETB (Ethiopian Birr)' },
  { code: 'EUR', label: 'EUR (Euro)' },
  { code: 'FJD', label: 'FJD (Fijian Dollar)' },
  { code: 'FKP', label: 'FKP (Falkland Islands Pound)' },
  { code: 'FOK', label: 'FOK (Faroese Króna)' },
  { code: 'GBP', label: 'GBP (British Pound)' },
  { code: 'GEL', label: 'GEL (Georgian Lari)' },
  { code: 'GGP', label: 'GGP (Guernsey Pound)' },
  { code: 'GHS', label: 'GHS (Ghanaian Cedi)' },
  { code: 'GIP', label: 'GIP (Gibraltar Pound)' },
  { code: 'GMD', label: 'GMD (Gambian Dalasi)' },
  { code: 'GNF', label: 'GNF (Guinean Franc)' },
  { code: 'GTQ', label: 'GTQ (Guatemalan Quetzal)' },
  { code: 'GYD', label: 'GYD (Guyanese Dollar)' },
  { code: 'HKD', label: 'HKD (Hong Kong Dollar)' },
  { code: 'HNL', label: 'HNL (Honduran Lempira)' },
  { code: 'HRK', label: 'HRK (Croatian Kuna)' },
  { code: 'HTG', label: 'HTG (Haitian Gourde)' },
  { code: 'HUF', label: 'HUF (Hungarian Forint)' },
  { code: 'IDR', label: 'IDR (Indonesian Rupiah)' },
  { code: 'ILS', label: 'ILS (Israeli New Shekel)' },
  { code: 'IMP', label: 'IMP (Isle of Man Pound)' },
  { code: 'INR', label: 'INR (Indian Rupee)' },
  { code: 'IQD', label: 'IQD (Iraqi Dinar)' },
  { code: 'IRR', label: 'IRR (Iranian Rial)' },
  { code: 'ISK', label: 'ISK (Icelandic Króna)' },
  { code: 'JEP', label: 'JEP (Jersey Pound)' },
  { code: 'JMD', label: 'JMD (Jamaican Dollar)' },
  { code: 'JOD', label: 'JOD (Jordanian Dinar)' },
  { code: 'JPY', label: 'JPY (Japanese Yen)' },
  { code: 'KES', label: 'KES (Kenyan Shilling)' },
  { code: 'KGS', label: 'KGS (Kyrgyzstani Som)' },
  { code: 'KHR', label: 'KHR (Cambodian Riel)' },
  { code: 'KMF', label: 'KMF (Comorian Franc)' },
  { code: 'KRW', label: 'KRW (South Korean Won)' },
  { code: 'KWD', label: 'KWD (Kuwaiti Dinar)' },
  { code: 'KYD', label: 'KYD (Cayman Islands Dollar)' },
  { code: 'KZT', label: 'KZT (Kazakhstani Tenge)' },
  { code: 'LAK', label: 'LAK (Lao Kip)' },
  { code: 'LBP', label: 'LBP (Lebanese Pound)' },
  { code: 'LKR', label: 'LKR (Sri Lankan Rupee)' },
  { code: 'LRD', label: 'LRD (Liberian Dollar)' },
  { code: 'LSL', label: 'LSL (Lesotho Loti)' },
  { code: 'LYD', label: 'LYD (Libyan Dinar)' },
  { code: 'MAD', label: 'MAD (Moroccan Dirham)' },
  { code: 'MDL', label: 'MDL (Moldovan Leu)' },
  { code: 'MGA', label: 'MGA (Malagasy Ariary)' },
  { code: 'MKD', label: 'MKD (Macedonian Denar)' },
  { code: 'MMK', label: 'MMK (Myanmar Kyat)' },
  { code: 'MNT', label: 'MNT (Mongolian Tugrik)' },
  { code: 'MOP', label: 'MOP (Macanese Pataca)' },
  { code: 'MRU', label: 'MRU (Mauritanian Ouguiya)' },
  { code: 'MUR', label: 'MUR (Mauritian Rupee)' },
  { code: 'MVR', label: 'MVR (Maldivian Rufiyaa)' },
  { code: 'MWK', label: 'MWK (Malawian Kwacha)' },
  { code: 'MXN', label: 'MXN (Mexican Peso)' },
  { code: 'MYR', label: 'MYR (Malaysian Ringgit)' },
  { code: 'MZN', label: 'MZN (Mozambican Metical)' },
  { code: 'NAD', label: 'NAD (Namibian Dollar)' },
  { code: 'NGN', label: 'NGN (Nigerian Naira)' },
  { code: 'NIO', label: 'NIO (Nicaraguan Córdoba)' },
  { code: 'NOK', label: 'NOK (Norwegian Krone)' },
  { code: 'NPR', label: 'NPR (Nepalese Rupee)' },
  { code: 'NZD', label: 'NZD (New Zealand Dollar)' },
  { code: 'OMR', label: 'OMR (Omani Rial)' },
  { code: 'PAB', label: 'PAB (Panamanian Balboa)' },
  { code: 'PEN', label: 'PEN (Peruvian Sol)' },
  { code: 'PGK', label: 'PGK (Papua New Guinean Kina)' },
  { code: 'PHP', label: 'PHP (Philippine Peso)' },
  { code: 'PKR', label: 'PKR (Pakistani Rupee)' },
  { code: 'PLN', label: 'PLN (Polish Zloty)' },
  { code: 'PYG', label: 'PYG (Paraguayan Guarani)' },
  { code: 'QAR', label: 'QAR (Qatari Rial)' },
  { code: 'RON', label: 'RON (Romanian Leu)' },
  { code: 'RSD', label: 'RSD (Serbian Dinar)' },
  { code: 'RUB', label: 'RUB (Russian Ruble)' },
  { code: 'RWF', label: 'RWF (Rwandan Franc)' },
  { code: 'SAR', label: 'SAR (Saudi Riyal)' },
  { code: 'SBD', label: 'SBD (Solomon Islands Dollar)' },
  { code: 'SCR', label: 'SCR (Seychellois Rupee)' },
  { code: 'SDG', label: 'SDG (Sudanese Pound)' },
  { code: 'SEK', label: 'SEK (Swedish Krona)' },
  { code: 'SGD', label: 'SGD (Singapore Dollar)' },
  { code: 'SHP', label: 'SHP (Saint Helena Pound)' },
  { code: 'SLL', label: 'SLL (Sierra Leonean Leone)' },
  { code: 'SOS', label: 'SOS (Somali Shilling)' },
  { code: 'SRD', label: 'SRD (Surinamese Dollar)' },
  { code: 'SSP', label: 'SSP (South Sudanese Pound)' },
  { code: 'STN', label: 'STN (São Tomé and Príncipe Dobra)' },
  { code: 'SYP', label: 'SYP (Syrian Pound)' },
  { code: 'SZL', label: 'SZL (Eswatini Lilangeni)' },
  { code: 'THB', label: 'THB (Thai Baht)' },
  { code: 'TJS', label: 'TJS (Tajikistani Somoni)' },
  { code: 'TMT', label: 'TMT (Turkmenistani Manat)' },
  { code: 'TND', label: 'TND (Tunisian Dinar)' },
  { code: 'TOP', label: 'TOP (Tongan Paʻanga)' },
  { code: 'TRY', label: 'TRY (Turkish Lira)' },
  { code: 'TTD', label: 'TTD (Trinidad and Tobago Dollar)' },
  { code: 'TVD', label: 'TVD (Tuvaluan Dollar)' },
  { code: 'TWD', label: 'TWD (New Taiwan Dollar)' },
  { code: 'TZS', label: 'TZS (Tanzanian Shilling)' },
  { code: 'UAH', label: 'UAH (Ukrainian Hryvnia)' },
  { code: 'UGX', label: 'UGX (Ugandan Shilling)' },
  { code: 'USD', label: 'USD (United States Dollar)' },
  { code: 'UYU', label: 'UYU (Uruguayan Peso)' },
  { code: 'UZS', label: 'UZS (Uzbekistani Som)' },
  { code: 'VES', label: 'VES (Venezuelan Bolívar Soberano)' },
  { code: 'VND', label: 'VND (Vietnamese Dong)' },
  { code: 'VUV', label: 'VUV (Vanuatu Vatu)' },
  { code: 'WST', label: 'WST (Samoan Tala)' },
  { code: 'XAF', label: 'XAF (Central African CFA Franc)' },
  { code: 'XCD', label: 'XCD (East Caribbean Dollar)' },
  { code: 'XOF', label: 'XOF (West African CFA Franc)' },
  { code: 'XPF', label: 'XPF (CFP Franc)' },
  { code: 'YER', label: 'YER (Yemeni Rial)' },
  { code: 'ZAR', label: 'ZAR (South African Rand)' },
  { code: 'ZMW', label: 'ZMW (Zambian Kwacha)' },
  { code: 'ZWL', label: 'ZWL (Zimbabwean Dollar)' }
];

const BudgetCalculator = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  
  // Start with an empty expense list
  const [expenses, setExpenses] = useState([]);
  const [currency, setCurrency] = useState('EUR'); // default currency
  const [message, setMessage] = useState('');

  // Calculate total from expense amounts
  const calculateTotal = () => {
    return expenses.reduce((acc, expense) => acc + (parseFloat(expense.amount) || 0), 0);
  };
  const totalBudget = calculateTotal();

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/trips/${tripId}/budget`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data) {
          if (response.data.expenses) {
            setExpenses(response.data.expenses);
          }
          if (response.data.currency) {
            setCurrency(response.data.currency);
          }
        }
      } catch (error) {
        console.error("Error fetching budget:", error);
      }
    };
    fetchBudget();
  }, [tripId]);

  const handleExpenseChange = (index, field, value) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index] = { ...updatedExpenses[index], [field]: value };
    setExpenses(updatedExpenses);
  };

  const addExpenseItem = () => {
    setExpenses([...expenses, { category: '', amount: '' }]);
  };

  const removeExpenseItem = (index) => {
    const updatedExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(updatedExpenses);
  };

  const handleSaveBudget = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = { totalBudget, expenses, currency };
      await axios.put(`http://localhost:5000/api/trips/${tripId}/budget`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Budget saved successfully!");
    } catch (error) {
      console.error("Error saving budget:", error);
      setMessage("Failed to save budget.");
    }
  };

  // Prepare data for the pie chart visualization
  const chartData = {
    labels: expenses.map(expense => expense.category) || [],
    datasets: [
      {
        data: expenses.map(expense => parseFloat(expense.amount) || 0),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          // You can add more colors if needed
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ]
      }
    ]
  };

  return (
    <div className="budget-container">
      <h1>Budget Calculator</h1>
      <div className="budget-form">
        <div className="currency-selector">
          <label htmlFor="currency">Currency:</label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {currencyOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <h2>Expenses</h2>
        {expenses.length === 0 && (
          <p>No expenses added. Click "Add Expense" to begin.</p>
        )}
        {expenses.map((expense, index) => (
          <div key={index} className="expense-item">
            <input
              type="text"
              value={expense.category}
              onChange={(e) => handleExpenseChange(index, 'category', e.target.value)}
              placeholder="Expense category (e.g., Accommodation)"
            />
            <input
              type="number"
              value={expense.amount}
              onChange={(e) => handleExpenseChange(index, 'amount', e.target.value)}
              placeholder="Amount"
            />
            <button onClick={() => removeExpenseItem(index)} className="remove-expense-button">
              Remove
            </button>
          </div>
        ))}
        <button onClick={addExpenseItem} className="add-expense-button">Add Expense</button>

        {/* Expense Visualization */}
        {expenses.length > 0 && (
          <div className="chart-container">
            <h2>Expense Distribution</h2>
            <Pie
  data={chartData}
  options={{ maintainAspectRatio: false }}
  width={300}
  height={300}
/>

          </div>
        )}

        <div className="total-budget">
          <strong>Total Budget: </strong>
          <span>{totalBudget} {currency}</span>
        </div>

        <button onClick={handleSaveBudget} className="save-budget-button">Save Budget</button>
        {message && <p className="message">{message}</p>}
      </div>
      <button onClick={() => navigate(-1)} className="back-button">Back to Trip Info</button>
    </div>


  );
};

export default BudgetCalculator;


  