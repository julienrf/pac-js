package models

case class Task(name: String, done: Boolean) {
  
  def toggleDone = this.copy(done = !done)
  
}
