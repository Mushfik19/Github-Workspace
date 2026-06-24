export function LoadingState({ message = 'Loading workspace data...' }) {
  return (
    <div className="loading-state">
      <h3 className="section-heading">Working on it</h3>
      <p>{message}</p>
    </div>
  )
}
