import AsyncStorage from '@react-native-async-storage/async-storage';   

export type Lista = {
  id: string;
  title: string;
  completed: boolean;
  date: string;
  itens: Item[];
};

const LISTAS_KEY = "listas";

export type Item = {
  id: string;
  name: string;
  quantity: number;
  price?: number;
  completed: boolean;
};


export async function salvarLista(id: string, title: string, itens: Item[], date?: string): Promise<Lista> {
  try {
    const listas = await carregarListas();
    const existingIndex = listas.findIndex(lista => lista.id === id);
    const listaAtualizada: Lista = {
      id: id || Date.now().toString(),
      title: title,
      completed: existingIndex >= 0 ? listas[existingIndex].completed : false,
      date: date ?? (existingIndex >= 0 ? listas[existingIndex].date : new Date().toISOString()),
      itens: itens,
    };

    if (existingIndex >= 0) {
      listas[existingIndex] = listaAtualizada;
    } else {
      listas.push(listaAtualizada);
    }
    await AsyncStorage.setItem(LISTAS_KEY, JSON.stringify(listas));
    return listaAtualizada;
  } catch (error) {
    console.error("Erro ao salvar a lista:", error);
    throw error;
  }
}

export async function carregarListas(): Promise<Lista[]> {
  try {
    const textoSalvo = await AsyncStorage.getItem(LISTAS_KEY);
    if (textoSalvo !== null) {
      return JSON.parse(textoSalvo) as Lista[];
    }
    return [];
  } catch (error) {
    console.error("Erro ao carregar as listas:", error);
    return [];
  }
}

export async function DeletarLista(id: string): Promise<void> {
  try {
    const listas = await carregarListas();
    const novasListas = listas.filter(lista => lista.id !== id);
    await AsyncStorage.setItem(LISTAS_KEY, JSON.stringify(novasListas));
  } catch (error) {
    console.error("Erro ao deletar a lista:", error);
  }
}

export async function SalvarItem(id: string, name: string, quantity: number, price?: number): Promise<Item> {
  try {
    const listas = await carregarListas();
    const lista = listas.find(l => l.id === id);
    if (!lista) {
      throw new Error("Erro: lista não encontrada");
    }
    const novoItem: Item = {
      id: Date.now().toString(),
      name: name,
      quantity: quantity,
      price: price,
      completed: false
    };
    lista.itens.push(novoItem);
    await AsyncStorage.setItem(LISTAS_KEY, JSON.stringify(listas));
    return novoItem;
  } catch (error) {
    console.error("Erro ao salvar o item:", error);
    throw error;
  }
}