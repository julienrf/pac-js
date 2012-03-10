package dao

trait InMemoryCrud[A] extends Crud[A] {
  
  def find(id: Long): Option[A] = entities.get(id)
  
  def findAll: Iterable[(Long, A)] = entities.iterator.toIterable
  
  def create(entity: A): Long = synchronized {
    counter = counter + 1
    entities += counter -> entity
    counter
  }
  
  def update(id: Long, entity: A): Option[A] = {
    for {
      _ <- entities.get(id)
    } yield {
      entities += id -> entity
      entity
    }
  }
  
  def delete(id: Long) {
    entities -= id
  }
  
  private[this] val entities = collection.mutable.LinkedHashMap.empty[Long, A]
  private[this] var counter: Long = 0
}