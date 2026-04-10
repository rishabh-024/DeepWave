import Shell from "../app/Shell";
import AdminPanel from "./AdminPanel";

const AdminPage = () => {
  return (
    <Shell>
      <div className="pb-24 pt-28 sm:pt-32">
        <AdminPanel />
      </div>
    </Shell>
  );
};

export default AdminPage;
