package dao

trait Crud[A] {
  def find(id: Long): Option[A]
  def findAll: Iterable[(Long, A)]
  def create(task: A): Long
  def update(id: Long, task: A): Option[A]
  def delete(id: Long)
}