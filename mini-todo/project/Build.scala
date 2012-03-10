import sbt._
import Keys._
import PlayProject._

object ApplicationBuild extends Build {

    val appName         = "mini-todo"
    val appVersion      = "1.0"

    val appDependencies = Nil

    val main = PlayProject(appName, appVersion, appDependencies, mainLang = SCALA)

}
