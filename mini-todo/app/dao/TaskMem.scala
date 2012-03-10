package dao

import models.Task

trait TaskMem extends TaskDao with InMemoryCrud[Task]