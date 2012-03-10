package controllers

import models.Task
import play.api.libs.json.Format
import play.api.libs.json.Generic.productFormat2

package object jsonProtocols {
  
  implicit val taskProtocol: Format[Task] = productFormat2("name", "done")(Task)(Task.unapply)
  
}