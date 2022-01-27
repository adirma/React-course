
import DateItem from'./DateItem.js'
import './DateItem.css';

function ExpenseItem(props){
    const ExpenseTitle =props.title;
    const ExpenseDescription=props.description;
    return (
    <div>

        <div className="expense-item">
            <DateItem  date={props.date} ></DateItem>
            <h2>{ExpenseTitle}</h2>
            <div className="expense-item__price"> description : {ExpenseDescription}</div>
        </div>
    </div> );
    
}
export default ExpenseItem;