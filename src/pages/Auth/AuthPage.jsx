import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const defaultForm = {
  name: '',
  username: '',
  email: '',
  identifier: '',
  password: '',
  confirmPassword: '',
}

export function AuthPage({ mode }) {
  const navigate = useNavigate()
  const { isAuthenticated, login, register } = useAuth()
  const [formData, setFormData] = useState(defaultForm)
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const isRegister = mode === 'register'

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => {
      if (name === 'name' && isRegister && !prev.username) {
        return {
          ...prev,
          name: value,
          username: value
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, ''),
        }
      }

      return { ...prev, [name]: value }
    })
  }

  function validate() {
    if (!formData.password) {
      return 'Password is required.'
    }
    if (isRegister && !formData.name.trim()) {
      return 'Name is required.'
    }
    if (isRegister && !formData.username.trim()) {
      return 'Username is required.'
    }
    if (!isRegister && !formData.identifier.trim()) {
      return 'Username or email is required.'
    }
    if (isRegister && !formData.email.trim()) {
      return 'Email is required.'
    }
    if (isRegister && formData.password.length < 6) {
      return 'Password should be at least 6 characters.'
    }
    if (isRegister && formData.password !== formData.confirmPassword) {
      return 'Passwords do not match.'
    }
    return ''
  }

  function handleSubmit(event) {
    event.preventDefault()
    const validationError = validate()

    if (validationError) {
      setError(validationError)
      return
    }

    try {
      if (isRegister) {
        register(formData)
      } else {
        login(formData)
      }
      navigate('/dashboard')
    } catch (submitError) {
      setError(submitError.message)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card panel">
        <span className="badge">{isRegister ? 'Create workspace account' : 'Welcome back'}</span>
        <h1>{isRegister ? 'Set up your GitHub Workspace' : 'Enter your workspace'}</h1>
        <p>
          Clean demo authentication with saved session, protected routes, and friendly username login.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister ? (
            <label>
              <span>Name</span>
              <input className="field" name="name" value={formData.name} onChange={handleChange} />
            </label>
          ) : null}

          {isRegister ? (
            <label>
              <span>Username</span>
              <input
                className="field"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g. mushfik_dev"
              />
            </label>
          ) : null}

          {!isRegister ? (
            <label>
              <span>Username or email</span>
              <input
                className="field"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Enter username or email"
              />
            </label>
          ) : null}

          {isRegister ? (
            <label>
              <span>Email</span>
              <input
                className="field"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </label>
          ) : null}

          <label>
            <span>Password</span>
            <input
              className="field"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </label>

          {isRegister ? (
            <label>
              <span>Confirm password</span>
              <input
                className="field"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </label>
          ) : null}

          {error ? <div className="error-text">{error}</div> : null}
          {!isRegister ? (
            <div className="helper-text">You can login with username, name, or email.</div>
          ) : null}

          <button className="primary-btn" type="submit">
            {isRegister ? 'Create account' : 'Login'}
          </button>
        </form>

        <p className="footer-note">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link to={isRegister ? '/login' : '/register'} style={{ color: 'var(--primary)' }}>
            {isRegister ? 'Login here' : 'Register here'}
          </Link>
        </p>
      </div>
    </div>
  )
}
