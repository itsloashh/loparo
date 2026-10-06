import { cache } from "react";
import { loadAdminData } from "./queries";

/** One read per request, shared by the admin layout and page. */
export const getAdminData = cache(loadAdminData);
