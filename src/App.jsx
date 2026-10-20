

import { useEffect, useMemo, useState } from "react";

import "./App.css";



const API_BASE_URL = "http://localhost:5000/api";
const API_URL = `${API_BASE_URL}/movies`;



const DEFAULT_POSTER =

  "https://placehold.co/500x750/17141f/d2c4ff?text=Movie+Poster";



const POSTER_FALLBACKS = {

  Interstellar:

    "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",

  "The Dark Knight":

    "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",

};



function formatDuration(duration) {

  if (typeof duration === "string" && duration.trim()) {

    return duration;

  }



  const minutes = Number(duration);



  if (!Number.isFinite(minutes) || minutes <= 0) {

    return "Duration unavailable";

  }



  const hours = Math.floor(minutes / 60);

  const remainingMinutes = minutes % 60;



  return hours > 0

    ? `${hours}h ${remainingMinutes}m`

    : `${remainingMinutes}m`;

}



function normalizeMovie(movie) {

  const genres = Array.isArray(movie.genre)

    ? movie.genre

    : [movie.genre || "Other"];



  const title = movie.title || "Untitled Movie";



  return {

    ...movie,

    id: movie._id || movie.id || title,

    title,

    genreList: genres,

    genre: genres.join(", "),

    rating: Number(movie.rating) || 0,

    duration: formatDuration(movie.duration),

    price: Number(movie.price ?? movie.ticketPrice ?? 220),

    year:

      movie.releaseYear ||

      movie.year ||

      (movie.releaseDate

        ? new Date(movie.releaseDate).getFullYear()

        : "—"),

    poster:

      movie.posterUrl ||

      movie.poster ||

      POSTER_FALLBACKS[title] ||

      DEFAULT_POSTER,

    description: movie.description || "Discover this film at iMovies.",

  };

}



function getLocalDateString() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function App() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showtime, setShowtime] = useState("7:00 PM");
  const [showDate, setShowDate] = useState(getLocalDateString());
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [availabilityRefresh, setAvailabilityRefresh] = useState(0);

  
const [authView, setAuthView] = useState("home");
const [authName, setAuthName] = useState("");
const [authEmail, setAuthEmail] = useState("");
const [authPassword, setAuthPassword] = useState("");
const [authConfirmPassword, setAuthConfirmPassword] = useState("");
const [authError, setAuthError] = useState("");
const [authLoading, setAuthLoading] = useState(false);
const [currentUser, setCurrentUser] = useState(null);

const [showMyBookings, setShowMyBookings] = useState(false);
const [myBookings, setMyBookings] = useState([]);
const [myBookingsLoading, setMyBookingsLoading] = useState(false);
const [myBookingsError, setMyBookingsError] = useState("");

const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

async function handleAuthSubmit(event) {
  event.preventDefault();
  setAuthError("");

  const isRegister = authView === "register";

  if (isRegister && !authName.trim()) {
    setAuthError("Please enter your name.");
    return;
  }

  if (!authEmail.trim() || !authPassword) {
    setAuthError("Please enter your email and password.");
    return;
  }

  if (isRegister && authPassword.length < 8) {
    setAuthError("Password must be at least 8 characters.");
    return;
  }

  if (isRegister && authPassword !== authConfirmPassword) {
    setAuthError("Passwords do not match.");
    return;
  }

  setAuthLoading(true);

  try {
    const endpoint = isRegister ? "register" : "login";

    const response = await fetch(
      `http://localhost:5000/api/auth/${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isRegister
            ? {
                name: authName.trim(),
                email: authEmail.trim(),
                password: authPassword,
              }
            : {
                email: authEmail.trim(),
                password: authPassword,
              }
        ),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Authentication failed.");
    }

    sessionStorage.setItem("imoviesToken", data.token);
    setCurrentUser(data.user);
    setAuthPassword("");
    setAuthConfirmPassword("");
    setAuthError("");
    setAuthView("home");
  } catch (error) {
    setAuthError(
      error.message || "Could not connect to the server."
    );
  } finally {
    setAuthLoading(false);
  }
}

function handleLogout() {
  sessionStorage.removeItem("imoviesToken");
  setCurrentUser(null);
  setAuthName("");
  setAuthEmail("");
  setAuthPassword("");
  setAuthConfirmPassword("");
  setAuthError("");
  setAuthView("home");
}

async function fetchMyBookings() {
  const token = sessionStorage.getItem("imoviesToken");

  if (!token) {
    setAuthView("login");
    setAuthError("Please sign in to view your bookings.");
    setShowMyBookings(false);
    return;
  }

  setShowMyBookings(true);
  setMyBookingsLoading(true);
  setMyBookingsError("");

  try {
    const response = await fetch(`${API_BASE_URL}/bookings/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to load your bookings.");
    }

    setMyBookings(data.bookings || []);
  } catch (error) {
    setMyBookingsError(error.message || "Could not connect to the server.");
  } finally {
    setMyBookingsLoading(false);
  }
}


  function openBooking(movie) {
    if (!movie) return;
    setSelectedMovie(movie);
    setShowtime("7:00 PM");
    setShowDate(getLocalDateString());
    setSelectedSeats([]);
    setBookedSeats([]);
    setAvailabilityError("");
    setBookingError("");
    setBookingMessage("");
  }

  function closeBooking() {
    if (bookingLoading) return;
    setSelectedMovie(null);
    setSelectedSeats([]);
    setBookingError("");
    setBookingMessage("");
  }

  function toggleSeat(seat) {
    if (bookedSeats.includes(seat) || availabilityLoading || bookingLoading) return;
    setBookingError("");
    setBookingMessage("");
    setSelectedSeats((current) =>
      current.includes(seat)
        ? current.filter((item) => item !== seat)
        : [...current, seat]
    );
  }

  async function confirmBooking() {
    if (!selectedMovie || selectedSeats.length === 0) {
      setBookingError("Please select at least one seat.");
      return;
    }

    setBookingLoading(true);
    setBookingError("");
    setBookingMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: "POST",
        
headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionStorage.getItem("imoviesToken")}`,
},

        body: JSON.stringify({
          movieId: selectedMovie.id,
          movieTitle: selectedMovie.title,
          showDate,
          showtime,
          seats: selectedSeats,
          ticketPrice: selectedMovie.price,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        if (response.status === 409) {
          setAvailabilityRefresh((value) => value + 1);
        }
        throw new Error(data.message || "Booking could not be completed.");
      }

      setBookingMessage(
        `Booking confirmed! Reference: ${String(data.booking?._id || "").slice(-8).toUpperCase()}`
      );
      setSelectedSeats([]);
      setAvailabilityRefresh((value) => value + 1);
    } catch (error) {
      setBookingError(error.message || "Unable to connect to the booking server.");
    } finally {
      setBookingLoading(false);
    }
  }



  const [movies, setMovies] = useState([]);

  const [loadingMovies, setLoadingMovies] = useState(true);

  const [moviesError, setMoviesError] = useState("");



  useEffect(() => {

    const controller = new AbortController();



    async function fetchMovies() {

      try {

        setLoadingMovies(true);

        setMoviesError("");



        const response = await fetch(API_URL, {

          signal: controller.signal,

        });



        if (!response.ok) {

          throw new Error(`Request failed (${response.status})`);

        }



        const data = await response.json();



        if (!data.success || !Array.isArray(data.movies)) {

          throw new Error("The movie API returned an unexpected response.");

        }



        setMovies(data.movies.map(normalizeMovie));

      } catch (error) {

        if (error.name !== "AbortError") {

          console.error("Error fetching movies:", error);

          setMoviesError(

            "Unable to load movies. Please check that the backend is running."

          );

        }

      } finally {

        if (!controller.signal.aborted) {

          setLoadingMovies(false);

        }

      }

    }



    fetchMovies();



    return () => controller.abort();

  }, []);



  useEffect(() => {
    if (!selectedMovie || !showDate || !showtime) return undefined;

    const controller = new AbortController();
    async function fetchAvailability() {
      setAvailabilityLoading(true);
      setAvailabilityError("");
      try {
        const params = new URLSearchParams({
          movieId: selectedMovie.id,
          showDate,
          showtime,
        });
        const response = await fetch(
          `${API_BASE_URL}/bookings/availability?${params.toString()}`,
          { signal: controller.signal }
        );
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to check seat availability.");
        }
        setBookedSeats(Array.isArray(data.bookedSeats) ? data.bookedSeats : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setAvailabilityError(error.message || "Unable to check seat availability.");
        }
      } finally {
        if (!controller.signal.aborted) setAvailabilityLoading(false);
      }
    }

    fetchAvailability();
    return () => controller.abort();
  }, [selectedMovie, showDate, showtime, availabilityRefresh]);

  const genres = useMemo(() => {

    const allGenres = movies.flatMap((movie) => movie.genreList);

    return ["All", ...new Set(allGenres.filter(Boolean))];

  }, [movies]);



  const filteredMovies = useMemo(() => {

    const query = search.trim().toLowerCase();



    return movies.filter((movie) => {

      const matchesSearch =

        movie.title.toLowerCase().includes(query) ||

        movie.genre.toLowerCase().includes(query);



      const matchesGenre =

        genre === "All" || movie.genreList.includes(genre);



      return matchesSearch && matchesGenre;

    });

  }, [movies, search, genre]);



  const featuredMovie =

    movies.find(

      (movie) =>

        movie.featured === true ||

        movie.isFeatured === true ||

        movie.title === "Interstellar"

    ) || movies[0];



  return (

    <div className="app">

      <header className="navbar">

        <a className="brand" href="#home">

          <span className="brand-icon">M</span>

          <span>

            imovies<span className="brand-dot">.</span>

          </span>

        </a>



        <nav className="nav-links">

          <a className="active" href="#home">Discover</a>

          <a href="#movies">Movies</a>

          <a href="#about">About</a>

        </nav>



<div className="nav-actions">
  {currentUser ? (
    <>
    
<button
  type="button"
  className="secondary-button"
  onClick={fetchMyBookings}
>
  My Bookings
</button>

      <span className="nav-user">
        Hi, {currentUser.name}
      </span>
      <button
        type="button"
        className="secondary-button"
        onClick={handleLogout}
      >
        Logout
      </button>
    </>
  ) : (
    <>
      <button
        type="button"
        className="secondary-button"
        onClick={() => {
          setAuthView("login");
          setAuthError("");
        }}
      >
        Sign In
      </button>
      <button
        type="button"
        className="nav-cta"
        onClick={() => {
          setAuthView("register");
          setAuthError("");
        }}
      >
        Sign Up
      </button>
    </>
  )}

  <a className="nav-cta" href="#movies">
    Book a movie <span>↗</span>
  </a>
</div>


      </header>
      
{authView !== "home" && (
  <div className="auth-overlay">
    <section className="auth-card">
      <button
        type="button"
        className="auth-close"
        onClick={() => {
          setAuthView("home");
          setAuthError("");
        }}
        aria-label="Close authentication form"
      >
        ×
      </button>

      <div className="auth-brand">iMovies<span>.</span></div>

      <p className="auth-subtitle">
        {authView === "register" ? "Create your account" : "Welcome back"}
      </p>

      <form onSubmit={handleAuthSubmit}>
        {authView === "register" && (
          <label className="auth-field">
            Full name
            <input
              type="text"
              value={authName}
              onChange={(event) => setAuthName(event.target.value)}
              placeholder="Enter your name"
              autoComplete="name"
              required
            />
          </label>
        )}

        <label className="auth-field">
          Email
          <input
            type="email"
            value={authEmail}
            onChange={(event) => setAuthEmail(event.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            required
          />
        </label>

        
<label className="auth-field">
  Password
  <div className="password-input-wrap">
    <input
      type={showPassword ? "text" : "password"}
      value={authPassword}
      onChange={(event) => setAuthPassword(event.target.value)}
      placeholder="Enter your password"
      autoComplete={
        authView === "register" ? "new-password" : "current-password"
      }
      minLength={authView === "register" ? 8 : undefined}
      required
    />
    <button
      type="button"
      className="password-toggle"
      onClick={() => setShowPassword((previous) => !previous)}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? "Hide" : "Show"}
    </button>
  </div>
</label>


        {authView === "register" && (
          
<label className="auth-field">
  Confirm password
  <div className="password-input-wrap">
    <input
      type={showConfirmPassword ? "text" : "password"}
      value={authConfirmPassword}
      onChange={(event) => setAuthConfirmPassword(event.target.value)}
      placeholder="Confirm your password"
      autoComplete="new-password"
      minLength={8}
      required
    />
    <button
      type="button"
      className="password-toggle"
      onClick={() =>
        setShowConfirmPassword((previous) => !previous)
      }
      aria-label={
        showConfirmPassword ? "Hide password" : "Show password"
      }
    >
      {showConfirmPassword ? "Hide" : "Show"}
    </button>
  </div>
</label>

        )}

        {authError && (
          <p className="auth-error" role="alert">{authError}</p>
        )}

        <button
          type="submit"
          className="primary-button auth-submit"
          disabled={authLoading}
        >
          {authLoading
            ? "Please wait..."
            : authView === "register"
              ? "Create Account"
              : "Sign In"}
        </button>
      </form>

      <p className="auth-switch">
        {authView === "register"
          ? "Already have an account?"
          : "New to iMovies?"}
        {" "}
        <button
          type="button"
          onClick={() => {
            setAuthView(authView === "register" ? "login" : "register");
            setAuthError("");
          }}
        >
          {authView === "register" ? "Sign In" : "Sign Up"}
        </button>
      </p>
    </section>
  </div>
)}

{showMyBookings && (
  <section className="my-bookings-section" id="my-bookings">
    <div className="my-bookings-heading">
      <div>
        <p className="section-label">YOUR ACCOUNT</p>
        <h2>My Bookings<span className="brand-dot">.</span></h2>
        <p className="section-subtitle">
          Your movie plans, all in one place.
        </p>
      </div>

      <button
        type="button"
        className="secondary-button"
        onClick={() => setShowMyBookings(false)}
      >
        Back to movies
      </button>
    </div>

    {myBookingsLoading && (
      <p role="status">Loading your bookings...</p>
    )}

    {myBookingsError && (
      <p className="booking-error" role="alert">
        {myBookingsError}
      </p>
    )}

    {!myBookingsLoading &&
      !myBookingsError &&
      myBookings.length === 0 && (
        <div className="empty-state">
          <h3>No bookings yet</h3>
          <p>Your confirmed movie bookings will appear here.</p>
          <button
            type="button"
            onClick={() => setShowMyBookings(false)}
          >
            Explore movies
          </button>
        </div>
      )}

    {!myBookingsLoading && !myBookingsError && (
      <div className="my-bookings-list">
        {myBookings.map((booking) => (
          <article
            className="my-booking-card"
            key={booking._id}
          >
            <div>
              <h3>{booking.movieTitle}</h3>
              <p>
                <strong>Date:</strong> {booking.showDate}
              </p>
              <p>
                <strong>Showtime:</strong> {booking.showtime}
              </p>
              <p>
                <strong>Seats:</strong> {booking.seats.join(", ")}
              </p>
              <p>
                <strong>Booking reference:</strong>{" "}
                {booking._id.slice(-8).toUpperCase()}
              </p>
            </div>

            <div className="my-booking-summary">
              <strong>₹{booking.totalAmount}</strong>
              <span className="booking-status">
                {booking.status}
              </span>
            </div>
          </article>
        ))}
      </div>
    )}
  </section>
)}





      <main>

        <section className="hero" id="home">

          {featuredMovie && (

            <img

              className="hero-image"

              src={featuredMovie.poster}

              alt=""

              onError={(event) => {

                event.currentTarget.onerror = null;

                event.currentTarget.src = DEFAULT_POSTER;

              }}

            />

          )}



          <div className="hero-overlay" />



          <div className="hero-content">

            <div className="eyebrow">

              <span className="live-dot" /> THE BIG SCREEN EXPERIENCE

            </div>



            <p className="hero-kicker">

              {featuredMovie

                ? `FEATURED FILM · ${featuredMovie.year}`

                : "DISCOVER YOUR NEXT FILM"}

            </p>



            <h1>

              Stories worth

              <br />

              leaving home for.

            </h1>



            <p className="hero-description">

              Discover unforgettable films. Find your showtime.

              Make tonight a movie night.

            </p>



            <div className="hero-actions">

              <button

                className="primary-button"

                disabled={!featuredMovie}

                onClick={() => openBooking(featuredMovie)}

              >

                Book {featuredMovie?.title || "a movie"} <span>↗</span>

              </button>



              <a className="secondary-button" href="#movies">

                Explore movies <span>↓</span>

              </a>

            </div>



            <div className="hero-rating">

              <span className="rating-star">★</span>

              <strong>

                {featuredMovie ? `${featuredMovie.rating}/10` : "—"}

              </strong>

              <span>Audience favourite</span>

            </div>

          </div>



          <div className="hero-index">

            <span>01</span> / {String(movies.length).padStart(2, "0")}

          </div>

        </section>



        <section className="movies-section" id="movies">

          <div className="section-heading">

            <div>

              <p className="section-label">YOUR NEXT FAVOURITE</p>

              <h2>

                Now showing<span className="brand-dot">.</span>

              </h2>

              <p className="section-subtitle">

                A little escape, just a ticket away.

              </p>

            </div>



            <span className="movie-count">

              {loadingMovies ? "LOADING..." : `${filteredMovies.length} FILMS`}

            </span>

          </div>



          <div className="movie-tools">

            <div className="genre-filters">

              {genres.map((item) => (

                <button

                  key={item}

                  className={`genre-chip ${

                    genre === item ? "selected" : ""

                  }`}

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



          {loadingMovies && (

            <p className="section-subtitle" role="status">

              Loading movies from iMovies...

            </p>

          )}



          {moviesError && (

            <div className="empty-state" role="alert">

              <h3>Couldn't load movies</h3>

              <p>{moviesError}</p>

              <button onClick={() => window.location.reload()}>

                Try again

              </button>

            </div>

          )}



          {!loadingMovies && !moviesError && (

            <>

              <div className="movie-grid">

                {filteredMovies.map((movie) => (

                  <article className="movie-card" key={movie.id}>

                    <button

                      className="poster-button"

                      onClick={() => openBooking(movie)}

                      aria-label={`View ${movie.title}`}

                    >

                      <img

                        className="movie-poster"

                        src={movie.poster}

                        alt={`${movie.title} poster`}

                        loading="lazy"

                        onError={(event) => {

                          event.currentTarget.onerror = null;

                          event.currentTarget.src = DEFAULT_POSTER;

                        }}

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



                      <p className="movie-meta">

                        {movie.genre} <span>·</span> {movie.duration}

                      </p>



                      <div className="movie-card-bottom">

                        <div>

                          <span className="price-caption">TICKETS FROM</span>

                          <strong>₹{movie.price}</strong>

                        </div>



                        <button

                          className="round-button"

                          onClick={() => openBooking(movie)}

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

                  <button

                    onClick={() => {

                      setSearch("");

                      setGenre("All");

                    }}

                  >

                    Clear filters

                  </button>

                </div>

              )}

            </>

          )}

        </section>



        <section className="experience-banner" id="about">

          <div>

            <p className="section-label">THE IMOVIES PROMISE</p>

            <h2>

              Less scrolling.

              <br />

              More cinema.

            </h2>

            <p>

              Find your film, choose your time, and get ready for the show.

            </p>

          </div>



          <a href="#movies" className="banner-link">

            Find your next film ↗

          </a>

        </section>

      </main>



      <footer className="footer">

        <a className="brand footer-brand" href="#home">

          <span className="brand-icon">M</span>

          <span>

            imovies<span className="brand-dot">.</span>

          </span>

        </a>



        <p>Made for people who love the movies.</p>

        <span>© 2026 IMovies · Student project</span>

      </footer>



      {selectedMovie && (

        <div

          className="modal-backdrop"

          onClick={closeBooking}

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

              onClick={closeBooking}

              aria-label="Close"

            >

              ×

            </button>



            <img

              className="modal-poster"

              src={selectedMovie.poster}

              alt={`${selectedMovie.title} poster`}

              onError={(event) => {

                event.currentTarget.onerror = null;

                event.currentTarget.src = DEFAULT_POSTER;

              }}

            />



            <div className="modal-content">
              <p className="section-label">YOUR MOVIE NIGHT</p>
              <h2>{selectedMovie.title}</h2>
              <p className="movie-meta">
                {selectedMovie.year} · {selectedMovie.genre} · {selectedMovie.duration}
              </p>
              <p className="modal-description">{selectedMovie.description}</p>

              <div className="booking-fields">
                <label className="showtime-label" htmlFor="showDate">
                  Choose a date
                </label>
                <input
                  id="showDate"
                  className="booking-date-input"
                  type="date"
                  min={getLocalDateString()}
                  value={showDate}
                  onChange={(event) => {
                    setShowDate(event.target.value);
                    setSelectedSeats([]);
                    setBookingError("");
                    setBookingMessage("");
                  }}
                />

                <label className="showtime-label" htmlFor="showtime">
                  Choose a showtime
                </label>
                <select
                  id="showtime"
                  value={showtime}
                  onChange={(event) => {
                    setShowtime(event.target.value);
                    setSelectedSeats([]);
                    setBookingError("");
                    setBookingMessage("");
                  }}
                >
                  <option>1:00 PM</option>
                  <option>4:00 PM</option>
                  <option>7:00 PM</option>
                  <option>10:00 PM</option>
                </select>
              </div>

              <div className="seat-selection">
                <div className="screen-label">SCREEN</div>
                <div className="seat-legend">
                  <span><i className="seat-legend-box available" /> Available</span>
                  <span><i className="seat-legend-box selected" /> Selected</span>
                  <span><i className="seat-legend-box booked" /> Booked</span>
                </div>

                {availabilityLoading && (
                  <p className="seat-status" role="status">Checking seat availability…</p>
                )}
                {availabilityError && (
                  <p className="booking-error" role="alert">{availabilityError}</p>
                )}

                <div className="seat-grid" aria-label="Choose your seats">
                  {"ABCDEF".split("").map((row) => (
                    <div className="seat-row" key={row}>
                      <span className="seat-row-label">{row}</span>
                      {Array.from({ length: 8 }, (_, index) => {
                        const seat = `${row}${index + 1}`;
                        const isBooked = bookedSeats.includes(seat);
                        const isSelected = selectedSeats.includes(seat);
                        return (
                          <button
                            type="button"
                            key={seat}
                            className={`seat-button ${isBooked ? "booked" : ""} ${isSelected ? "selected" : ""}`}
                            disabled={isBooked || availabilityLoading || Boolean(availabilityError) || bookingLoading}
                            aria-pressed={isSelected}
                            aria-label={`Seat ${seat}${isBooked ? ", booked" : isSelected ? ", selected" : ", available"}`}
                            onClick={() => toggleSeat(seat)}
                          >
                            {index + 1}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <p className="seat-status">
                  {selectedSeats.length
                    ? `Selected seats: ${selectedSeats.join(", ")}`
                    : "Select one or more seats to continue."}
                </p>
              </div>

              <div className="booking-total">
                <span>{selectedSeats.length} ticket{selectedSeats.length === 1 ? "" : "s"} × ₹{selectedMovie.price}</span>
                <strong>₹{selectedSeats.length * selectedMovie.price}</strong>
              </div>

              {bookingError && <p className="booking-error" role="alert">{bookingError}</p>}
              {bookingMessage && <p className="booking-success" role="status">{bookingMessage}</p>}

              <button
                className="primary-button modal-book"
                disabled={bookingLoading || availabilityLoading || Boolean(availabilityError) || selectedSeats.length === 0}
                onClick={confirmBooking}
              >
                {bookingLoading ? "Confirming booking…" : "Confirm booking ↗"}
              </button>
              <p className="demo-note">
                Demo payment is not enabled. This confirms a booking in the database without charging money.
              </p>
            </div>

          </section>

        </div>

      )}

    </div>

  );

}



export default App;
