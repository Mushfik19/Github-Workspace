import { useState } from 'react'
import { EmptyState } from '../../components/common/EmptyState'
import { PageHeader } from '../../components/common/PageHeader'
import { useWorkspace } from '../../context/WorkspaceContext'
import { formatDate } from '../../utils/format'

export function CollectionsPage() {
  const { collections, createCollection, deleteCollection } = useWorkspace()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim()) {
      return
    }

    createCollection(name.trim(), description.trim())
    setName('')
    setDescription('')
  }

  return (
    <div className="list-grid">
      <PageHeader
        badge="Module 5"
        title="Repository collections"
        description="Group repositories by purpose so your GitHub research can turn into actual workstreams."
      />

      <section className="grid-two">
        <form className="card form-grid" onSubmit={handleSubmit}>
          <h2 className="section-heading">Create a new collection</h2>
          <input
            className="field"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Collection name"
          />
          <textarea
            className="textarea"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Why are you saving these repositories?"
          />
          <button className="primary-btn" type="submit">
            Create collection
          </button>
        </form>

        <section className="collections-grid">
          {collections.map((collection) => (
            <article className="collection-card" key={collection.id}>
              <div className="space-between">
                <div>
                  <strong>{collection.name}</strong>
                  <p className="muted">{collection.description}</p>
                </div>
                <button className="danger-btn" type="button" onClick={() => deleteCollection(collection.id)}>
                  Delete
                </button>
              </div>
              <p className="helper-text">{collection.items.length} repositories saved</p>
              <p className="helper-text">Created {formatDate(collection.createdAt)}</p>
            </article>
          ))}
        </section>
      </section>

      {!collections.length ? (
        <EmptyState
          title="No collections yet"
          message="Create one to start organizing repositories by business use case or learning goal."
        />
      ) : null}
    </div>
  )
}
