import tasksDb from '../../../../public/data/tasks_db.json';
import Home from '../../page';

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(tasksDb.tasks).map((task) => ({
    taskName: task.name,
  }));
}

export default function TaskPage({ params }: { params: { taskName: string } }) {
  return <Home initialTaskName={params.taskName} />;
}
