package services

import models.Task
import dao.TaskDao
import dao.Crud

/* Service layer */
trait TasksService {
  
  def tasks: Tasks
  
  trait Tasks extends Crud[Task] {
    this: TaskDao =>
  
    /* The only operation provided by this great service */
    def toggle(id: Long): Option[Task] = {
      for {
        oldTask <- find(id)
        task <- update(id, oldTask.toggleDone)
      } yield task
    }
  }
}
