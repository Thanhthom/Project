import { ThumbsUp, MessageSquare } from "lucide-react"
import "./CommentsSection.css"

interface Comment {
  id: string
  author: string
  avatarUrl: string
  timestamp: string
  content: string
  likes: number
}

interface CommentsSectionProps {
  comments: Comment[]
}

export function CommentsSection({ comments }: CommentsSectionProps) {
  return (
    <div className="comments-section">
      <h2 className="comments-title">Comments</h2>

      <div className="comment-input-section">
        <div className="user-avatar">
          <div className="avatar-fallback">YO</div>
        </div>
        <div className="input-container">
          <textarea placeholder="Write a comment..." className="comment-textarea" />
          <button className="post-button">Post Comment</button>
        </div>
      </div>

      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <div className="comment-avatar">
              <img
                src={comment.avatarUrl || "./notfilm.jpg"}
                alt={`${comment.author} Avatar`}
                className="avatar-image"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                  e.currentTarget.nextElementSibling!.classList.add("active");

                }}
              />
              <div className="avatar-fallback">{comment.author.substring(0, 2).toUpperCase()}</div>
            </div>

            <div className="comment-content">
              <div className="comment-header">
                <span className="author-name">{comment.author}</span>
                <span className="comment-timestamp">{comment.timestamp}</span>
              </div>

              <p className="comment-text">{comment.content}</p>

              <div className="comment-actions">
                <button className="action-button like-button">
                  <ThumbsUp className="action-icon" />
                  {comment.likes}
                </button>
                <button className="action-button reply-button">
                  <MessageSquare className="action-icon" />
                  Reply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
