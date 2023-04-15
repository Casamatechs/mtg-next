import { Card } from "../utils/types";

const CardDetails = (props: { card: Card }) => {
  const { card } = props;
  return (
    <div className="h-40 w-full">
      <p className="text-white"key={card.id}>
        [{card.store}] {card.name} - {card.price} (Stock: {card.stock})
      </p>
    </div>
  );
};

export default CardDetails;
