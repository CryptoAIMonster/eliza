import { Leaderboard } from "@/components/leaderboard";
import { getUsers } from "@/lib/get-users";

export default function Home() {
  const users = getUsers();

  return (
    <main className="container mx-auto p-4">
      <Leaderboard users={users} period="all" />
    </main>
  );
}
