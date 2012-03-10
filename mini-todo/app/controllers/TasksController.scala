package controllers

import play.api.mvc._
import play.api.data._
import play.api.data.Forms._
import play.api.libs.json.Json
import dao.TaskMem
import models.Task
import services.TasksService
import jsonProtocols.taskProtocol
import views._

trait TasksController extends Controller {
  this: TasksService =>
  
  def index = Action { implicit request =>
    Ok(html.index(tasks.findAll))
  }
  
  def edit(id: Long) = Action {
    (for {
      task <- tasks.find(id)
    } yield {
      Ok(html.edit(id, editForm.fill(task)))
    }) getOrElse NotFound
  }
  
  def create = Action { implicit request =>
    val referrer = request.headers.get("referer").getOrElse(routes.Tasks.index.url)
    createForm.bindFromRequest.fold(
        f => Redirect(referrer).flashing("error"->"Enter a name!"), // TODO Display an error message
        v => {
          tasks.create(v)
          Redirect(referrer)
        }
    )
  }
  
  def read(id: Long) = Action {
    tasks.find(id) map (task => Ok(Json.toJson(task))) getOrElse NotFound
  }
  
  def update(id: Long) = Action { implicit request =>
    editForm.bindFromRequest.fold(
        f => BadRequest(html.edit(id, editForm)),
        v => {
          tasks.update(id, v)
          Redirect(routes.Tasks.index)
        }
    )
  }
  
  def delete(id: Long) = Action {
    tasks.delete(id)
    Redirect(routes.Tasks.index)
  }
  
  def toggle(id: Long) = Action {
    tasks.toggle(id) map (task => Ok(Json.toJson(task))) getOrElse NotFound
  }
  
  def tasks1 = Action { implicit request =>
    Ok(html.tasks1(tasks.findAll))
  }
  
  def tasks2 = Action { implicit request =>
    Ok(html.tasks2(tasks.findAll))
  }
  
  def tasks3 = Action { implicit request =>
    Ok(html.tasks3(tasks.findAll))
  }
  
  def tasks4 = Action { implicit request =>
    Ok(html.tasks4(tasks.findAll))
  }
  
  private val createForm = Form(
      mapping(
          "name" -> nonEmptyText,
          "done" -> ignored(false)
      )(Task.apply)(Task.unapply)
  )
  
  private val editForm = Form(
      mapping(
          "name" -> nonEmptyText,
          "done" -> boolean
      )(Task.apply)(Task.unapply)
  )

}