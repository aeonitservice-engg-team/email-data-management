'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout';
import { Button, Card, CardHeader, CardContent, Input, Select, Modal, useToast, ConfirmModal } from '@/components/ui';
import { useData } from '@/contexts/DataContext';
import styles from './page.module.css';

interface Brand {
  id: string;
  name: string;
  code: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  _count?: {
    journals: number;
  };
}

export default function BrandsPage() {
  const { addToast } = useToast();
  const { brands: cachedBrands, fetchStats, lastFetched } = useData();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-fetch if no cached data exists
  useEffect(() => {
    if (!lastFetched) {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastFetched]);

  // Use cached brands
  useEffect(() => {
    if (cachedBrands.length > 0) {
      setBrands(cachedBrands as Brand[]);
    }
    setIsLoading(false);
  }, [cachedBrands]);

  const handleOpenModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        code: brand.code,
        status: brand.status,
      });
    } else {
      setEditingBrand(null);
      setFormData({
        name: '',
        code: '',
        status: 'ACTIVE',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    setFormData({ name: '', code: '', status: 'ACTIVE' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.code.trim()) {
      addToast('Name and code are required', 'error');
      return;
    }

    try {
      const url = editingBrand ? `/api/brands/${editingBrand.id}` : '/api/brands';
      const method = editingBrand ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save brand');
      }

      addToast(
        editingBrand ? 'Brand updated successfully' : 'Brand created successfully',
        'success'
      );
      handleCloseModal();
      // Refresh data from server
      fetchStats();
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to save brand', 'error');
    }
  };

  const handleDeleteClick = (brand: Brand) => {
    if (brand._count && brand._count.journals > 0) {
      addToast(
        `Cannot delete brand with ${brand._count.journals} associated journals`,
        'error'
      );
      return;
    }
    setBrandToDelete(brand);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!brandToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/brands/${brandToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete brand');
      }

      addToast('Brand deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      setBrandToDelete(null);
      // Refresh data from server
      fetchStats();
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to delete brand', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Header
        title="Brand Management"
        description="Manage brands and their associated journals"
      />

      <div className={styles.container}>
        <div className={styles.header}>
          <Button onClick={() => handleOpenModal()}>
            Add New Brand
          </Button>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Loading brands...</div>
        ) : (
          <div className={styles.grid}>
            {brands.map((brand) => (
              <Card key={brand.id}>
                <CardContent>
                  <div className={styles.brandCard}>
                    <div className={styles.brandInfo}>
                      <h3 className={styles.brandName}>{brand.name}</h3>
                      <p className={styles.brandCode}>Code: {brand.code}</p>
                      <p className={styles.brandStatus}>
                        Status: <span className={brand.status === 'ACTIVE' ? styles.active : styles.inactive}>
                          {brand.status}
                        </span>
                      </p>
                      {brand._count && (
                        <p className={styles.journalCount}>
                          {brand._count.journals} journal{brand._count.journals !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <div className={styles.brandActions}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(brand)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(brand)}
                        disabled={brand._count ? brand._count.journals > 0 : false}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {brands.length === 0 && !isLoading && (
          <Card>
            <CardContent>
              <div className={styles.empty}>
                <p>No brands found. Create your first brand to get started.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBrand ? 'Edit Brand' : 'Add New Brand'}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Brand Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., GlobalMeetX"
            required
            fullWidth
          />

          <Input
            label="Brand Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="e.g., GMX"
            required
            fullWidth
            maxLength={10}
          />

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
            options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]}
            fullWidth
          />

          <div className={styles.modalActions}>
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingBrand ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Brand"
        message={`Are you sure you want to delete "${brandToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </>
  );
}
