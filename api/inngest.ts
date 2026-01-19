import { serve } from "inngest/edge";
import { inngest } from "../src/lib/inngest/client";
import { userCompletedLab } from "../src/inngest/functions/userCompletedLab";

export const config = {
    runtime: "edge",
};

export default serve({
    client: inngest,
    functions: [
        userCompletedLab,
    ],
});
