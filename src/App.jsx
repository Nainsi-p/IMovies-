
import { useMemo, useState } from "react";
import "./App.css";

const movies = [
  {
    id: 1,
    title: "Interstellar",
    genre: "Sci-Fi",
    rating: 8.7,
    duration: "2h 49m",
    price: 220,
    year: 2014,
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    description:
      "A team of explorers travels beyond this galaxy to discover whether mankind has a future among the stars.",
    featured: true,
  },
  {
    id: 2,
    title: "The Dark Knight",
    genre: "Action",
    rating: 9.0,
    duration: "2h 32m",
    price: 200,
    year: 2008,
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    description:
      "Batman faces his greatest challenge as Gotham is threatened by a criminal mastermind.",
  },
  {
    id: 3,
    title: "Inception",
    genre: "Thriller",
    rating: 8.8,
    duration: "2h 28m",
    price: 180,
    year: 2010,
    poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    description:
      "A skilled thief enters dreams to steal secrets and attempts an impossible final job.",
  },
  {
    id: 4,
    title: "Dune",
    genre: "Sci-Fi",
    rating: 8.0,
    duration: "2h 35m",
    price: 250,
    year: 2021,
    poster: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    description:
      "A young heir journeys to a dangerous desert planet where the future of his people awaits.",
  },
];

const genres = ["All", "Sci-Fi", "Action", "Thriller"];

function App() {
  
  const [search, setSearch] = useState("");
const [genre, setGenre] = useState("All");
const [selectedMovie, setSelectedMovie] = useState(null);
const [showtime, setShowtime] = useState("7:00 PM");

  const filteredMovies = useMemo(
    () =>
      movies.filter((movie) => {
        const matchesSearch = movie.title
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchesGenre = genre === "All" || movie.genre === genre;

        return matchesSearch && matchesGenre;
      }),
    [search, genre]
  );

  const featuredMovie = movies.find((movie) => movie.featured);

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#home">
          <span className="brand-icon">M</span>
          <span>imovies<span className="brand-dot">.</span></span>
        </a>

        <nav className="nav-links">
          <a className="active" href="#home">Discover</a>
          <a href="#movies">Movies</a>
          <a href="#about">About</a>
        </nav>

        <a className="nav-cta" href="#movies">Book a movie <span>↗</span></a>
      </header>

      <main>
        <section className="hero" id="home">
          <img
            className="hero-image"
            src={featuredMovie.poster}
            alt=""
          />
          <div className="hero-overlay" />

          <div className="hero-content">
            <div className="eyebrow">
              <span className="live-dot" /> THE BIG SCREEN EXPERIENCE
            </div>

            <p className="hero-kicker">FEATURED FILM · {featuredMovie.year}</p>
            <h1>Stories worth<br />leaving home for.</h1>
            <p className="hero-description">
              Discover unforgettable films. Find your showtime.
              Make tonight a movie night.
            </p>

            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={() => setSelectedMovie(featuredMovie)}
              >
                Book Interstellar <span>↗</span>
              </button>
              <a className="secondary-button" href="#movies">
                Explore movies <span>↓</span>
              </a>
            </div>

            <div className="hero-rating">
              <span className="rating-star">★</span>
              <strong>{featuredMovie.rating}/10</strong>
              <span>Audience favourite</span>
            </div>
          </div>

          <div className="hero-index">
            <span>01</span> / 04
          </div>
        </section>

        <section className="movies-section" id="movies">
          <div className="section-heading">
            <div>
              <p className="section-label">YOUR NEXT FAVOURITE</p>
              <h2>Now showing<span className="brand-dot">.</span></h2>
              <p className="section-subtitle">
                A little escape, just a ticket away.
              </p>
            </div>
            <span className="movie-count">
              {filteredMovies.length} FILMS
            </span>
          </div>

          <div className="movie-tools">
            <div className="genre-filters">
              {genres.map((item) => (
                <button
                  key={item}
                  className={`genre-chip ${genre === item ? "selected" : ""}`}
                  onClick={() => setGenre(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <label className="search-box">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Find a film..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <kbd>⌕</kbd>
            </label>
          </div>

          <div className="movie-grid">
            {filteredMovies.map((movie, index) => (
              <article className="movie-card" key={movie.id}>
                <button
                  className="poster-button"
                  onClick={() => setSelectedMovie(movie)}
                  aria-label={`View ${movie.title}`}
                >
                  <img
                    className="movie-poster"
                    src={movie.poster}
                    alt={`${movie.title} poster`}
                    loading="lazy"
                  />
                  <span className="poster-rating">
                    <span>★</span> {movie.rating}
                  </span>
                  <span className="poster-action">View film ↗</span>
                </button>

                <div className="movie-info">
                  <div className="movie-title-row">
                    <h3>{movie.title}</h3>
                    <span className="movie-year">{movie.year}</span>
                  </div>
                  <p className="movie-meta">{movie.genre} <span>·</span> {movie.duration}</p>

                  <div className="movie-card-bottom">
                    <div>
                      <span className="price-caption">TICKETS FROM</span>
                      <strong>₹{movie.price}</strong>
                    </div>
                    <button
                      className="round-button"
                      onClick={() => setSelectedMovie(movie)}
                      aria-label={`Book ${movie.title}`}
                    >
                      ↗
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredMovies.length === 0 && (
            <div className="empty-state">
              <span>⌕</span>
              <h3>No films found</h3>
              <p>Try another title or select a different genre.</p>
              <button onClick={() => { setSearch(""); setGenre("All"); }}>
                Clear filters
              </button>
            </div>
          )}
        </section>

        <section className="experience-banner" id="about">
          <div>
            <p className="section-label">THE IMOVIES PROMISE</p>
            <h2>Less scrolling.<br />More cinema.</h2>
            <p>Find your film, choose your time, and get ready for the show.</p>
          </div>
          <a href="#movies" className="banner-link">Find your next film ↗</a>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-icon">M</span>
          <span>imovies<span className="brand-dot">.</span></span>
        </a>
        <p>Made for people who love the movies.</p>
        <span>© 2026 IMovies · Student project</span>
      </footer>
      
{selectedMovie && (
  <div
    className="modal-backdrop"
    onClick={() => setSelectedMovie(null)}
  >
    <section
      className="booking-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="movie-modal-title"
      onClick={(event) => event.stopPropagation()}
    >
      <img
        className="modal-poster"
        src={selectedMovie.poster}
        alt={selectedMovie.title}
      />

      <div className="modal-content">
        <p className="section-label">YOUR NEXT WATCH</p>

        <h2 id="movie-modal-title">
          {selectedMovie.title}
        </h2>

        <p className="modal-description">
          {selectedMovie.genre} · {selectedMovie.year}
          <br />
          ★ {selectedMovie.rating.toFixed(1)} / 10
        </p>

        <p className="modal-description">
          Discover this film and get ready for your next
          cinema experience.
        </p>

        <div className="booking-total">
          <span>Ticket price</span>
          <strong>₹{selectedMovie.price}</strong>
        </div>

        <button
          className="primary-button modal-book"
          onClick={() => {
            alert(
              `Next step: choose a showtime for ${selectedMovie.title}.`
            );
          }}
        >
          Choose showtime ↗
        </button>

        <p className="demo-note">
          Demo booking flow. No ticket has been reserved yet.
        </p>

        <button
          className="secondary-button"
          onClick={() => setSelectedMovie(null)}
        >
          Close
        </button>
      </div>

      <button
        className="modal-close"
        aria-label="Close movie details"
        onClick={() => setSelectedMovie(null)}
      >
        ×
      </button>
    </section>
  </div>
)}
</>


      {selectedMovie && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedMovie(null)}
        >
          <section
            className="booking-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Book ${selectedMovie.title}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedMovie(null)}
              aria-label="Close"
            >
              ×
            </button>

            <img
              className="modal-poster"
              src={selectedMovie.poster}
              alt=""
            />

            <div className="modal-content">
              <p className="section-label">YOUR MOVIE NIGHT</p>
              <h2>{selectedMovie.title}</h2>
              <p className="movie-meta">
                {selectedMovie.year} · {selectedMovie.genre} · {selectedMovie.duration}
              </p>
              <p className="modal-description">{selectedMovie.description}</p>

              <label className="showtime-label" htmlFor="showtime">
                Choose a showtime
              </label>
              <select
                id="showtime"
                value={showtime}
                onChange={(event) => setShowtime(event.target.value)}
              >
                <option>1:00 PM</option>
                <option>4:00 PM</option>
                <option>7:00 PM</option>
                <option>10:00 PM</option>
              </select>

              <div className="booking-total">
                <span>Ticket starting price</span>
                <strong>₹{selectedMovie.price}</strong>
              </div>

              <button
                className="primary-button modal-book"
                onClick={() => {
                  alert(
                    `Selected ${selectedMovie.title} at ${showtime}. Seat selection is the next feature to build.`
                  );
                  setSelectedMovie(null);
                }}
              >
                Continue to booking ↗
              </button>
              <p className="demo-note">
                Demo stage: seats and reservations are not connected yet.
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;


