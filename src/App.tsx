import { User } from "firebase/auth";
import { useState } from "react";
import "./App.css";
import { CardImage } from "./card-image";
import { CARDS } from "./cards";
import { useAllUsers, useAuth, useWishlist } from "./firebase";

enum View {
  ALL_CARDS,
  MY_WISHLIST,
  MY_FRIENDS,
  FRIEND_WISHLIST,
}

interface Filters {
  set?: string;
  rarity?: string;
  type?: string;
}

const PAGE_SIZE = 9;

function App() {
  const { currentUser, isAuthLoading, performGoogleSignIn } = useAuth();
  const allUsers = useAllUsers();
  const [view, setView] = useState(View.ALL_CARDS);
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [friend, setFriend] = useState<Partial<User> | null>(null);

  const [myWishlist, addToMyWishlist, removeFromMyWishlist] =
    useWishlist(currentUser);
  const [friendWishlist] = useWishlist(friend);

  const onSetSelected = (set: string) => {
    setFilters((f) => ({ ...f, set }));
    setPage(1);
  };

  const onRaritySelected = (rarity: string) => {
    setFilters((f) => ({ ...f, rarity }));
    setPage(1);
  };

  const onTypeSelected = (type: string) => {
    setFilters((f) => ({ ...f, type }));
    setPage(1);
  };

  const onFriendSelected = (friend: Partial<User>) => {
    setFriend(friend);
    setView(View.FRIEND_WISHLIST);
  };

  const selectedCards =
    view === View.FRIEND_WISHLIST
      ? CARDS.filter((c) =>
          friendWishlist.some((w) => w.set === c.set && w.number === c.number)
        )
      : view === View.MY_WISHLIST
      ? CARDS.filter((c) =>
          myWishlist.some((w) => w.set === c.set && w.number === c.number)
        )
      : CARDS;

  const filteredCards = selectedCards
    .filter((c) => (filters.set ? c.set === filters.set : true))
    .filter((c) => (filters.rarity ? c.rarity === filters.rarity : true))
    .filter((c) => (filters.type ? c.type.startsWith(filters.type) : true));

  const resultMin = (page - 1) * PAGE_SIZE;
  const resultMax = Math.min(page * PAGE_SIZE, filteredCards.length);
  const numberOfPages = Math.ceil(filteredCards.length / PAGE_SIZE);

  const hasPrevPage = resultMin > 0;
  const hasNextPage = resultMax < filteredCards.length;

  const friends = allUsers.filter((u) => u.uid !== currentUser?.uid || true);

  if (isAuthLoading) {
    return <span>Loading...</span>;
  }

  if (!currentUser) {
    return <button onClick={performGoogleSignIn}>Sign In</button>;
  }

  return (
    <div>
      <button onClick={() => setView(View.ALL_CARDS)}>All Cards</button>
      <button onClick={() => setView(View.MY_WISHLIST)}>My Wishlist</button>
      <button onClick={() => setView(View.MY_FRIENDS)}>My Friends</button>
      {view === View.MY_FRIENDS ? (
        <div>
          {friends.map((u) => (
            <button key={u.uid} onClick={() => onFriendSelected(u)}>
              {u.displayName}
            </button>
          ))}
        </div>
      ) : (
        <div>
          {view === View.FRIEND_WISHLIST ? (
            <span>{friend?.displayName}'s Wishlist</span>
          ) : view === View.MY_WISHLIST ? (
            <span>My Wishlist</span>
          ) : (
            <span>All Cards</span>
          )}
          <div>
            <label>Set:</label>
            <select onChange={(event) => onSetSelected(event.target.value)}>
              <option value="">All Sets</option>
              <option value="A1">Genetic Apex</option>
              <option value="A1a">Mythical Island</option>
              <option value="A2">Space-Time Smackdown</option>
              <option value="A2a">Triumphant Light</option>
            </select>
            <label>Rarity:</label>
            <select onChange={(event) => onRaritySelected(event.target.value)}>
              <option value="">All Rarities</option>
              <option>◊</option>
              <option>◊◊</option>
              <option>◊◊◊</option>
              <option>◊◊◊◊</option>
              <option>☆</option>
              <option>☆☆</option>
              <option>☆☆☆</option>
              <option>👑</option>
              <option>Promo</option>
            </select>
            <label>Type:</label>
            <select onChange={(event) => onTypeSelected(event.target.value)}>
              <option value="">All Types</option>
              <option value="G">Grass</option>
              <option value="R">Fire</option>
              <option value="W">Water</option>
              <option value="L">Electric</option>
              <option value="P">Psychic</option>
              <option value="F">Fighting</option>
              <option value="D">Darkness</option>
              <option value="M">Metal</option>
              <option value="N">Dragon</option>
              <option value="C">Colorless</option>
              <option>Item</option>
              <option>Tool</option>
              <option>Supporter</option>
            </select>
          </div>
          <span>
            {resultMax > 0 ? (
              <>
                Showing Results {resultMin + 1} - {resultMax} (Page {page}/
                {numberOfPages})
              </>
            ) : (
              <>No results found</>
            )}
          </span>
          <button disabled={!hasPrevPage} onClick={() => setPage((p) => p - 1)}>
            Prev Page
          </button>
          <button disabled={!hasNextPage} onClick={() => setPage((p) => p + 1)}>
            Next Page
          </button>
          <div className="card-images">
            {filteredCards.slice(resultMin, resultMax).map((c) => {
              const isWishlisted = myWishlist.some(
                (w) => w.set === c.set && w.number === c.number
              );
              return (
                <CardImage
                  key={`${c.set}-${c.number}`}
                  card={c}
                  isWishlisted={view === View.ALL_CARDS ? isWishlisted : true}
                  onClick={
                    view !== View.ALL_CARDS
                      ? () => {}
                      : isWishlisted
                      ? () => removeFromMyWishlist(c)
                      : () => addToMyWishlist(c)
                  }
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
