package controllers

import services.TasksService
import dao.TaskMem

object Tasks extends TasksController with TasksService {
  val tasks = new Tasks with TaskMem
}