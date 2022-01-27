
function DateItem(props) {
    const month=props.date.toLocaleString('en-US',{month:'2-digit'});
    const day=props.date.toLocaleString('en-US',{day:'2-digit'});
    const year =props.date.getFullYear();

    return (
        <div className="item-date">{day}/{month}/{year}</div>
    );
}
export default DateItem;