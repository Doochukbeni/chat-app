import AddFriendButton from "@/components/AddFriendButton";
import React from "react";

const page = () => {
  return (
    <main className="pt-8">
      <h2 className="font-bold text-2xl md:text-5xl mb-8">Add a Friend</h2>
      <AddFriendButton />
    </main>
  );
};

export default page;
