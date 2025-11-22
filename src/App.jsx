import './App.css'

function App() {
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <nav className="nav">
          <div className="logo">Farab</div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Your Intelligent AI Assistant</h1>
          <p>
            Farab is your personal AI companion, designed to help you work smarter, 
            learn faster, and achieve more. Experience the power of advanced AI 
            technology at your fingertips.
          </p>
          <button className="cta-button">Get Started</button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <h2>Why Choose Farab?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Lightning Fast</h3>
              <p>
                Get instant responses powered by cutting-edge AI technology. 
                No waiting, just results.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3>Smart & Intuitive</h3>
              <p>
                Advanced natural language understanding that adapts to your 
                needs and learns from your interactions.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Private</h3>
              <p>
                Your data is protected with enterprise-grade security. 
                Privacy is our top priority.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💡</div>
              <h3>Always Learning</h3>
              <p>
                Continuously improving AI that gets better over time, 
                providing you with increasingly valuable insights.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Available Anywhere</h3>
              <p>
                Access Farab from any device, anywhere in the world. 
                Your AI assistant is always with you.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Easy to Use</h3>
              <p>
                Simple, intuitive interface designed for everyone. 
                No technical knowledge required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 Farab AI. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
