"use client";

import { Types } from "mongoose";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  X,
  Edit,
  Check,
  Trash2,
  PlusCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import { ICategory, ISubcategory } from "@/lib/db/models";

interface CategoryWithId extends Omit<ICategory, "_id"> {
  _id: string;
}

interface SubcategoryWithDetails
  extends Omit<ISubcategory, "_id" | "category"> {
  _id: string;
  category:
    | Types.ObjectId
    | {
        name: string;
        _id: string;
      };
}

export default function CategoriesManagementPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryWithId[]>([]);
  const [newCategory, setNewCategory] = useState<string>("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editedCategoryName, setEditedCategoryName] = useState<string>("");

  const [subcategories, setSubcategories] = useState<SubcategoryWithDetails[]>(
    []
  );
  const [newSubcategoryName, setNewSubcategoryName] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<
    string | null
  >(null);
  const [editedSubcategoryName, setEditedSubcategoryName] =
    useState<string>("");

  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    type: "category" | "subcategory";
  } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/moderation/categories");
    } else if (
      status === "authenticated" &&
      session.user.role !== "moderator"
    ) {
      router.push("/");
    } else {
      fetchCategories();
      fetchSubcategories();
    }
  }, [status, session, router]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data);

      const expanded: Record<string, boolean> = {};
      data.forEach((category: CategoryWithId) => {
        expanded[category._id] = expandedCategories[category._id] || false;
      });
      setExpandedCategories(expanded);
    } catch (err) {
      console.error(err);
      setError("Failed to load categories");
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await fetch("/api/subcategories");
      if (!response.ok) {
        throw new Error("Failed to fetch subcategories");
      }
      const data = await response.json();
      setSubcategories(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load subcategories");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setError("Category name cannot be empty");
      return;
    }

    try {
      setError(null);
      const response = await fetch("/api/categories/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCategory }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create category");
      }

      setSuccess("Category created successfully");
      setNewCategory("");
      fetchCategories();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create category"
      );
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategoryId || !editedCategoryName.trim()) {
      setError("Category name cannot be empty");
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/categories/${editingCategoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editedCategoryName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update category");
      }

      setSuccess("Category updated successfully");
      setEditingCategoryId(null);
      fetchCategories();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update category"
      );
    }
  };

  const handleUpdateSubcategory = async () => {
    if (!editingSubcategoryId || !editedSubcategoryName.trim()) {
      setError("Subcategory name cannot be empty");
      return;
    }

    try {
      setError(null);
      const response = await fetch(
        `/api/subcategories/${editingSubcategoryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: editedSubcategoryName }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update subcategory");
      }

      setSuccess("Subcategory updated successfully");
      setEditingSubcategoryId(null);
      fetchSubcategories();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update subcategory"
      );
    }
  };

  const handleAddSubcategory = async (categoryId: string) => {
    if (!newSubcategoryName.trim() || !categoryId) {
      setError("Subcategory name and category must be selected");
      return;
    }

    try {
      setError(null);
      const response = await fetch("/api/subcategories/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newSubcategoryName,
          categoryId: categoryId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create subcategory");
      }

      setSuccess("Subcategory created successfully");
      setNewSubcategoryName("");
      fetchSubcategories();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create subcategory"
      );
    }
  };

  const toggleExpandCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const startEditCategory = (category: CategoryWithId) => {
    setEditingCategoryId(category._id);
    setEditedCategoryName(category.name);
  };

  const startEditSubcategory = (subcategory: SubcategoryWithDetails) => {
    setEditingSubcategoryId(subcategory._id);
    setEditedSubcategoryName(subcategory.name);
  };

  const cancelEdit = () => {
    setEditingCategoryId(null);
    setEditingSubcategoryId(null);
  };

  const confirmDeleteItem = (id: string, type: "category" | "subcategory") => {
    setItemToDelete({ id, type });
    setShowDeleteModal(true);
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      setError(null);
      const endpoint =
        itemToDelete.type === "category"
          ? `/api/categories/${itemToDelete.id}`
          : `/api/subcategories/${itemToDelete.id}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.message || `Failed to delete ${itemToDelete.type}`
        );
      }

      setSuccess(
        `${
          itemToDelete.type === "category" ? "Category" : "Subcategory"
        } deleted successfully`
      );

      if (itemToDelete.type === "category") {
        fetchCategories();
        fetchSubcategories(); // Refresh subcategories as some might be deleted
      } else {
        fetchSubcategories();
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to delete ${itemToDelete.type}`
      );
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const getSubcategoriesForCategory = (categoryId: string) => {
    return subcategories.filter((subcategory) => {
      if (
        typeof subcategory.category === "object" &&
        subcategory.category !== null
      ) {
        return subcategory.category._id === categoryId;
      }
      return String(subcategory.category) === categoryId;
    });
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Category & Subcategory Management
      </h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-md mb-4">
          {success}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter category name"
          />
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2"
          >
            <PlusCircle className="h-5 w-5" /> Add
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Categories & Subcategories
        </h2>

        {categories.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No categories found. Create your first category above.
          </p>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <div
                key={category._id}
                className="border dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <div className="bg-gray-50 dark:bg-gray-700 p-4 flex items-center justify-between">
                  {editingCategoryId === category._id ? (
                    <div className="flex gap-2 flex-1">
                      <input
                        type="text"
                        value={editedCategoryName}
                        onChange={(e) => setEditedCategoryName(e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        onClick={handleUpdateCategory}
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        onClick={cancelEdit}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-2 cursor-pointer flex-1"
                      onClick={() => toggleExpandCategory(category._id)}
                    >
                      {expandedCategories[category._id] ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                      <h3 className="font-medium text-lg">{category.name}</h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                        {getSubcategoriesForCategory(category._id).length}
                      </span>
                    </div>
                  )}

                  {editingCategoryId !== category._id && (
                    <div className="flex gap-1">
                      <button
                        className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={() => startEditCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        onClick={() =>
                          confirmDeleteItem(category._id, "category")
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {expandedCategories[category._id] && (
                  <div className="p-4 bg-white dark:bg-gray-800">
                    <div className="mb-4 flex gap-2">
                      <input
                        type="text"
                        value={
                          selectedCategoryId === category._id
                            ? newSubcategoryName
                            : ""
                        }
                        onChange={(e) => {
                          setSelectedCategoryId(category._id);
                          setNewSubcategoryName(e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="New subcategory name"
                      />
                      <button
                        onClick={() => handleAddSubcategory(category._id)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <PlusCircle className="h-4 w-4" /> Add
                      </button>
                    </div>

                    <div className="pl-6 space-y-2">
                      {getSubcategoriesForCategory(category._id).length ===
                      0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          No subcategories yet
                        </p>
                      ) : (
                        getSubcategoriesForCategory(category._id).map(
                          (subcategory) => (
                            <div
                              key={subcategory._id}
                              className="flex items-center justify-between py-2 px-3 border-b dark:border-gray-700 last:border-0"
                            >
                              {editingSubcategoryId === subcategory._id ? (
                                <div className="flex gap-2 flex-1">
                                  <input
                                    type="text"
                                    value={editedSubcategoryName}
                                    onChange={(e) =>
                                      setEditedSubcategoryName(e.target.value)
                                    }
                                    className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                  />
                                  <button
                                    className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                                    onClick={handleUpdateSubcategory}
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                    onClick={cancelEdit}
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span>{subcategory.name}</span>
                                  <div className="flex gap-1">
                                    <button
                                      className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                      onClick={() =>
                                        startEditSubcategory(subcategory)
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                      onClick={() =>
                                        confirmDeleteItem(
                                          subcategory._id,
                                          "subcategory"
                                        )
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              {itemToDelete?.type === "category"
                ? "Are you sure you want to delete this category? All subcategories within this category will also be deleted."
                : "Are you sure you want to delete this subcategory?"}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
