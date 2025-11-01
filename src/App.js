import { useEffect, useState } from "react";
import supabase from "./supabase";

import "./style.css";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <span style={{ fontSize: "40px" }}>{count}</span>
      <button className="btn btn-large" onClick={() => setCount((c) => c + 1)}>
        +1
      </button>
    </div>
  );
}

function App() {
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");

  useEffect(
    function () {
      async function getQuotes() {
        setIsLoading(true);

        if (currentCategory !== "all")
          query = query.eq("category", currentCategory);

        const { data: quotes, error } = await query
          .order("votesInteresting", { ascending: false })
          .limit(1000);

        if (!error) setQuotes(quotes);
        else alert("There was a problem getting data");
        setIsLoading(false);
      }
      getQuotes();
    },
    [currentCategory]
  );

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />
      {showForm ? (
        <NewQuoteForm setQuotes={setQuotes} setShowForm={setShowForm} />
      ) : null}

      <main className="main pt-2 pb-2 mb-5">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />

        {isLoading ? (
          <Loader />
        ) : (
          <QuoteList quotes={quotes} setQuotes={setQuotes} />
        )}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

function Header({ showForm, setShowForm }) {
  const AppTitle = "Motiv Quotes";

  return (
    <header className="justify-content-center py-3 mb-4 border-bottom">
      <div className="d-flex justify-content-center py-3 mb-4">
        <h1>{AppTitle}</h1>
      </div>
      <div className="d-flex justify-content-center mt-4 mb-4">
        <button
          className="btn btn-large btn-dark btn-open"
        >
          {showForm ? "Close" : "Add a quote"}
        </button>
      </div>
    </header>
  );
}

const CATEGORIES = [
  { name: "god", color: "" },
  { name: "love", color: "" },
  { name: "life", color: "" },
  { name: "time", color: "" },
  { name: "wisdom", color: "" },
  { name: "death", color: "" },
  { name: "success", color: "" },
  { name: "happiness", color: "" },
];

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function NewQuoteForm({ setQuotes, setShowForm }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  async function handleSubmit(e) {
    // 1. Prevent browser reload
    e.preventDefault();
    console.log(text, source, category);

    // 2. Check the data is valid. If so, create a new quote
    if (text && isValidHttpUrl(source) && category && textLength <= 250) {
      // 3. Create a new quote object
      // const newQuote = {
      //   id: Math.round(Math.random() * 10000000),
      //   text,
      //   source,
      //   category,
      //   votesInteresting: 0,
      //   votesMindblowing: 0,
      //   votesFalse: 0,
      //   createdIn: new Date().getFullYear(),
      // };

      // 3. Upload quote to Supabase and receive the new quote object
      setIsUploading(true);
      const { data: newQuote, error } = await supabase
        .from("quotes")
        .insert([{ text, source, category }])
        .select();
      setIsUploading(false);

      // 4. Add the new quote to the UI: add the quote to state
      if (!error) setQuotes((quotes) => [newQuote[0], ...quotes]);

      // 5. Close the form.
      setShowForm(false);
    }
  }

  return (
    <form className="quote-form" onSubmit={handleSubmit}>
      <div className="container mt-5 mb-5">
        <div className="row">
          <div className="col-md-6 col-sm-12 p-2">
            <input
              type="text"
              className="form-control"
              placeholder="Add your favorite quote..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isUploading}
            />
            <span>{250 - textLength}</span>
          </div>
          <div className="col-md-3 col-sm-12 p-2">
            <input
              class="form-control"
              type="text"
              placeholder="Add your source link to share..."
              value={source}
              onChange={(e) => setSource(e.target.value)}
              disabled={isUploading}
            />
          </div>
          <div className="col-md-2 col-sm-12 p-2">
            <select
              class="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isUploading}
            >
              <option value="">Choose category:</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-1 col-sm-12 p-2">
            <button
              className="btn btn-dark btn-large btn-all-categories"
              disabled={isUploading}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-primary btn-all-categories"
            onClick={() => setCurrentCategory("all")}
          >
            All
          </button>
        </li>

        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-outline-secondary btn-category"
              style={{ backgroundColor: cat.color }}
              onClick={() => setCurrentCategory(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function QuoteList({ quotes, setQuotes }) {
  if (quotes.length === 0)
    return (
      <p className="message">
        No quotes for this tag yet! Create the first one.
      </p>
    );

  return (
    <section>
      <ul className="quotes-list">
        {quotes.map((quote) => (
          <Quote key={quote.id} quote={quote} setQuotes={setQuotes} />
        ))}
      </ul>
      <h5 className="ps-4 pt-4">
        There are {quotes.length} quotes in the database. Add your own!
      </h5>
    </section>
  );
}

function Quote({ quote, setQuotes }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed =
    quote.votesInteresting + quote.votesMindblowing < quote.votesFalse;

  async function handleVote(columnName) {
    setIsUpdating(true);
    const { data: updatedQuote, error } = await supabase
      .from("quotes")
      .update({ [columnName]: quote[columnName] + 1 })
      .eq("id", quote.id)
      .select();
    setIsUpdating(false);

    if (!error)
      setQuotes((quotes) =>
        quotes.map((f) => (f.id === quote.id ? updatedQuote[0] : f))
      );
  }

  return (
    <li className="quote">
      <p>
        {isDisputed ? <span className="disputed">[⛔️ DISPUTED]</span> : null}
        {quote.text}
        <a className="source" href={quote.source} target="_blank">
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === quote.category)
            .color,
        }}
      >
        {quote.category}
      </span>
      <div className="vote-buttons">
        <button
          onClick={() => handleVote("votesInteresting")}
          disabled={isUpdating}
        >
          👍 {quote.votesInteresting}
        </button>
        <button
          onClick={() => handleVote("votesMindblowing")}
          disabled={isUpdating}
        >
          🤯 {quote.votesMindblowing}
        </button>
        <button onClick={() => handleVote("votesFalse")} disabled={isUpdating}>
          ⛔️ {quote.votesFalse}
        </button>
      </div>
    </li>
  );
}

export default App;
