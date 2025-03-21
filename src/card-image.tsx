import { Card } from "./cards";

export const CardImage: React.FC<{
  card: Card;
  isWishlisted: boolean;
  onClick(): void;
}> = ({ card, isWishlisted, onClick }) => {
  const numberPadded = `00${card.number}`.slice(-3);
  const url = `https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/pocket/${card.set}/${card.set}_${numberPadded}_EN.webp`;
  return (
    <img
      className={isWishlisted ? "wishlisted" : ""}
      src={url}
      onClick={onClick}
    />
  );
};
