import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>PesaPal </h2>

      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/add" style={styles.link}>Add Expense</Link>
        <Link to="/" style={styles.link}>Login</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px",
    background: "#222",
    color: "white",
  },
  links: {
    display: "flex",
    gap: "10px",
  },
  link: {
    color: "white",
    textDecoration: "none",
  },
  logo: {
    margin: 0,
  },
};

export default Navbar;