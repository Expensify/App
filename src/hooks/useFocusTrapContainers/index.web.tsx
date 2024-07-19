import { useCallback, useState } from "react";
import { UseFocusTrapContainers } from "./type";

const useFocusTrapContainers: UseFocusTrapContainers = () => {
  const [containers, setContainers] = useState<HTMLElement[]>([]);

  const addContainer = useCallback((container: HTMLElement) => {
    const removeContainer = () => setContainers((prevContainers) => prevContainers.filter((c) => c !== container));
    setContainers((prevContainers) => prevContainers.includes(container) ? prevContainers : [...prevContainers, container]);

    return removeContainer;
  }, [])

  return [containers, addContainer]
}

export default useFocusTrapContainers;