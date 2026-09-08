import { motion } from "framer-motion";
import MenuSection from "../components/Menu";
import PageLayout from "../components/PageLayout";

export default function MenuPage() {
  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <MenuSection mode="page" />
      </motion.div>
    </PageLayout>
  );
}
