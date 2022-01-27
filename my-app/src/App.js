
import './App.css';
import ExpenseItem from'./components/ExpenseItem'
import './components/ExpenseItem.css';
function App() {
  const expenses = [
    {
      title: 'Toilet Paper 1',
      description: "my first expense description",
      date: new Date(2020, 7, 14),
    },

    {
      title: 'Toilet Paper 2',
      description: "my first expense description",
      date: new Date(2020, 7, 14),
    },

    {
      title: 'Toilet Paper 3',
      description: "my first expense description",
      date: new Date(2020, 7, 14),
    },

    {
      title: 'Toilet Paper 4',
      description: "my first expense description",
      date: new Date(2020, 7, 14),
    },
  ];
  return (

    <div>
          <h2> My Expense App</h2>
          <ExpenseItem
              title={expenses[0].title}
              date={expenses[0].date}
              description={expenses[0].description}
          ></ExpenseItem>
            <ExpenseItem
              title={expenses[1].title}
              date={expenses[1].date}
              description={expenses[1].description}
          ></ExpenseItem>
            <ExpenseItem
              title={expenses[2].title}
              date={expenses[2].date}
              description={expenses[2].description}
          ></ExpenseItem>
            <ExpenseItem
              title={expenses[3].title}
              date={expenses[3].date}
              description={expenses[3].description}
          ></ExpenseItem>
    </div>
  );
}

export default App;
