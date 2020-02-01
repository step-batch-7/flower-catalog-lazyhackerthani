class StatementNote {
  constructor(name, comment, time) {
    this.name = name;
    this.comment = comment;
    this.time = time;
  }
  toHTML() {
    return `<div class="commentBox"> ${
      this.name
    } ( ${this.time.toLocaleString()} ) : ${this.comment}</div>`;
  }
}

class CommentLog {
  constructor() {
    this.comments = [];
  }
  addComment(comment) {
    this.comments.unshift(comment);
  }
  toHTML() {
    return this.comments.map(comment => comment.toHTML()).join('');
  }
  static load(content) {
    const commentList = JSON.parse(content || '[]');
    const comments = new CommentLog();
    commentList.forEach(c => {
      comments.addComment(
        new StatementNote(c.name, c.comment, new Date(c.time))
      );
    });
    return comments;
  }
  toJSON() {
    return JSON.stringify(this.comments);
  }
}

module.exports = { StatementNote, CommentLog };
