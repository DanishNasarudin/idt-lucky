import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Codes from "../(sections)/Codes";
import { readData } from "../(serverActions)/manageJSON";

type Props = {};

const Admin = async (props: Props) => {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }
  return (
    <>
      {/* <div>Admin</div> */}
      <Codes />
    </>
  );
};

export default Admin;
